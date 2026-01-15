# Live Scoreboard System - Module Specification

## Overview

This document specifies the architecture and implementation requirements for a **Real-Time Scoreboard Module** that displays the top 10 users' scores with live updates. The system is designed to handle high-throughput score updates while preventing unauthorized score manipulation.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Architecture Overview](#architecture-overview)
3. [System Components](#system-components)
4. [Data Flow](#data-flow)
5. [API Specifications](#api-specifications)
6. [Security Measures](#security-measures)
7. [Summary](#summary)
8. [Next Steps for Implementation Team](#next-steps-for-implementation-team)

---

## System Requirements

### Functional Requirements

1. **Leaderboard Display**
   - Display top 10 users with their scores
   - Show user rank, username/ID, and current score
   - Real-time updates without page refresh

2. **Score Updates**
   - Users perform actions that increase their score
   - Score increments are computed server-side (never trust client)
   - Updates must be reflected in real-time to all connected clients

3. **Live Updates**
   - All connected clients receive leaderboard updates immediately
   - Only broadcast when top 10 changes
   - Support thousands of concurrent viewers

4. **Security**
   - Authenticate all score update requests
   - Prevent score manipulation by malicious users
   - Validate action completion server-side
   - Rate limiting to prevent abuse

### Non-Functional Requirements

- **Performance**: Handle 1000+ score updates per second
- **Latency**: Update propagation < 100ms
- **Scalability**: Support 10,000+ concurrent WebSocket connections
- **Availability**: 99.9% uptime SLA
- **Consistency**: Eventually consistent (acceptable for leaderboards)

### System Capacity & Scale

**User Base**:
- Total registered users: **1 million users**
- Peak concurrent users: **50,000 users** (5% of total)
- Active users performing actions: **10,000 users/minute**

**Throughput Requirements**:
- Score update requests: **1,000 - 2,000 requests/minute** during peak hours
- WebSocket connections: **10,000 - 50,000 concurrent connections**
- Leaderboard queries (HTTP fallback): **5,000 requests/minute**
- Database writes: **1,000 - 2,000 transactions/minute**
- Redis operations: **10,000+ operations/minute** (reads + writes)

**Data Volume**:
- User scores records: 1 million rows (~100 MB)
- User actions history: Growing at 2,000 records/minute (~500 MB/day)
- Redis leaderboard: Top 10,000 users cached (~1 MB)
- Database backup: Daily full backup + transaction logs
---

## Architecture Overview

### High-Level Architecture

![Scoreboard System Architecture](https://github.com/nguyenhunghau/assessment-nodejs/blob/main/problem_6_architecture/diagram.png?raw=true)

**Key Components:**

- **API Gateway**: Entry point for all HTTP requests, handles authentication and routing
- **JWT System**: Manages token generation, verification, and user context. We can use external service like Keycloak
- **App Server**: Core business logic, validates actions, calculates scores
- **RDS Database (AWS)**: Authoritative database storing all user scores and actions
- **EventBridge (AWS)**: Event bus for asynchronous, decoupled communication. We can use message queue like Kafka
- **ElastiCache Redis (Sorted Set and Pub/Sub Channel)**: High-speed in-memory cache for leaderboard, uses Sorted Sets for O(log N) performance
- **WebSocket API**: Maintains persistent connections with clients for real-time push notifications

**System Flow Description:**

The architecture consists of three main layers: **Backend Layer**, **Data Layer (AWS)**, and **Realtime Layer**.

#### Step-by-Step Flow:

**Step 1-2: User Authentication (Get the token)**
- User's browser sends authentication request to JWT System
- User provides credentials and receives JWT token for subsequent requests
- JWT token contains user identity, role, and permissions
- If credentials are invalid, system returns an error message with status code 401

**Step 3: Action Completion (Clients → API Gateway)**
- User performs an action (e.g., to update score ...)
- Client sends action completion request with JWT token
- API Gateway loads the public key from JWT system when starting, then uses it to validate token and forwards to App Server
- If token is valid, API Gateway redirects the request to the backend server
- If token is invalid, API Gateway returns error 401

**Step 4: Public Key Loading (API Gateway → JWT System)**
- API Gateway loads the public key from JWT System during startup
- Public key is cached in memory for token validation
- This enables stateless token verification without calling JWT System on every request

**Step 5: Score Calculation & Validation (App Server)**
- App Server validates the action is legitimate and not already completed
- Calculates score increment based on action type and difficulty (server-side calculation, never trust client)
- Checks for idempotency to prevent duplicate score awards
- Prepares to persist the score update

**Step 6: Database Update (App Server → RDS PostgreSQL)**
- App Server updates user's total score in PostgreSQL database
- Database is the single source of truth for all scores
- Uses optimistic locking to handle concurrent updates
- Records action completion to prevent duplicates
- Transaction ensures atomicity of score update and action logging

**Step 7: Event Publishing (App Server → EventBridge)**
- After successful database update, App Server publishes a "ScoreUpdated" event to AWS EventBridge
- Event contains: userId, new score, score increment, action ID, timestamp
- EventBridge enables event-driven architecture and decouples components
- Multiple consumers can subscribe to score update events

**Step 8: Consume Message (AWS Lambda)**
- AWS Lambda function (triggered by EventBridge) receives the score update event
- Lambda connects to ElastiCache Redis cluster
- Lambda executes leaderboard update logic

**Step 9: Leaderboard Update (Lambda → ElastiCache Redis)**
- Lambda retrieves current top 10 from Redis Sorted Set (ZSET)
- Updates user's score in the Sorted Set using ZADD command
- Compares new top 10 with previous top 10
- If top 10 changed, publishes notification to Redis pub/sub channel

**Step 10: Live Broadcast Decision (ElastiCache Redis → WebSocket API)**
- Redis publishes notification to WebSocket server via pub/sub channel (only if top 10 changed)
- This optimization reduces unnecessary broadcasts
- WebSocket server maintains all active client connections
- Prepares leaderboard update message with latest top 10 rankings

**Step 11: Real-Time Update to Clients (WebSocket API → Clients)**
- WebSocket server broadcasts leaderboard update to all connected clients
- Message contains new top 10 rankings with user IDs and scores
- Clients receive update and refresh their UI in real-time
- Update propagation happens in under 100ms
- Users see leaderboard changes without refreshing the page


## System Components

### 1. Client Layer (User Browser)

**Technology Stack**: Modern web browser with JavaScript support (React/Vue/Angular)

**Key Responsibilities**:
- Display leaderboard UI showing top 10 users with ranks and scores
- Establish and maintain WebSocket connection for real-time updates
- Send action completion requests to backend with JWT authentication
- Receive and render live leaderboard updates without page refresh
- Handle connection failures and reconnection logic

**User Experience**:
- Users see real-time rank changes with smooth animations
- Leaderboard updates appear within 100ms of score changes
- No manual refresh needed - updates are pushed automatically
- Clean, responsive design works on desktop and mobile browsers

---

### 2. Backend Layer

#### API Gateway

**Purpose**: Central entry point for all client requests

**Key Responsibilities**:
- Route incoming HTTP requests to appropriate handlers
- Validate JWT tokens on every protected endpoint
- Apply autoscaling to handle traffic spikes (scale to multiple pods/instances)
- Handle CORS for cross-origin requests
- Return consistent error responses with proper status codes
- Serve OpenAPI documentation for API reference

**Endpoints Provided**:
- POST /api/actions/complete - Record action completion
- GET /api/leaderboard - Retrieve current top 10 (HTTP fallback)
- GET /api/leaderboard/user/:userId - Get specific user's rank

#### JWT Authentication System

**Purpose**: Secure authentication and authorization

**Key Responsibilities**:
- Generate JWT tokens upon successful login with user claims (userId, email, role)
- Verify token signature and expiration on each request
- Extract user context from token and inject into request
- Maintain token blacklist for logged-out users
- Support token refresh mechanism for extended sessions

**Security Features**:
- Tokens use strong cryptographic signatures
- Short expiration times (24 hours) to limit exposure
- User context includes role-based permissions
- Stateless authentication - no server-side session storage needed

#### App Server (Action Handler)

**Purpose**: Core business logic for score management

**Key Responsibilities**:
- Validate that requested actions are legitimate and exist in the system
- Calculate score increments based on action type and difficulty (server-side only - never trust client input)
- Check for duplicate submissions using idempotency keys
- Update user scores in PostgreSQL database with transaction safety
- Publish "ScoreUpdated" events to EventBridge after successful updates
- Log all score changes for audit trail and debugging

**Business Rules Enforced**:
- Each action can only be completed once per user per day
- Score calculations follow predefined rules based on action difficulty
- Failed database updates do not trigger events (transactional integrity)
- All operations are logged with timestamp and user context

---

### 3. Data Layer (AWS Cloud Services)

#### RDS SQL Database

**Purpose**: Authoritative source of truth for all user data and scores

**Data Models**:
- **users**: User accounts with authentication credentials
- **user_scores**: Each user's total score, last update timestamp, version for optimistic locking
- **user_actions**: History of completed actions with scores awarded and timestamps

**Key Features**:
- ACID compliance ensures data integrity
- Optimistic locking prevents lost updates in concurrent scenarios
- Indexed queries for fast leaderboard generation
- Automated backups with point-in-time recovery
- Multi-AZ deployment for high availability

**Performance Characteristics**:
- Write throughput: 1,000-2,000 transactions/minute
- Read queries: Sub-100ms response time with proper indexing
- Storage capacity: Starts at 100GB, scales to 64TB
- Concurrent connections: Up to 5,000 simultaneous connections
- Use primary-replica (master-slave) architecture with read replicas to improve read performance

#### AWS EventBridge

**Purpose**: Event-driven communication between services

**Event Schema**:
Events published contain userId, new total score, score increment, action ID, and timestamp

**Key Benefits**:
- Decouples score updates from leaderboard updates
- Enables multiple consumers to react to score changes
- Built-in retry logic for failed deliveries
- Event archive for replay and debugging
- Supports fan-out pattern to multiple targets

**Event Consumers**:
- Lambda function to update Redis leaderboard
- Analytics service for reporting (optional)
- Notification service for achievements (optional)
- Alternative: Message queue like Kafka can be used to produce and consume events before updating Redis

#### ElastiCache Redis

**Purpose**: High-performance in-memory cache for leaderboard data

**Data Structure**: Redis Sorted Set (ZSET)
- Key: "leaderboard"
- Members: User IDs
- Scores: User total scores
- Automatically sorted by score in descending order

**Operations**:
- Update user score: O(log N) complexity - very fast even with millions of users
- Retrieve top 10: O(1) complexity - constant time retrieval
- Get user rank: O(log N) complexity - instant rank lookup
- Total users: O(1) complexity

**Performance Characteristics**:
- Sub-millisecond response times for all operations
- Handles 10,000+ operations per minute with ease
- Memory usage: ~100 bytes per user (1M users = 100MB)
- Persistence enabled for data durability
- Multi-AZ replication for high availability

**Caching Strategy**:
- Only stores top 10,000 users to optimize memory
- Updates happen asynchronously via Lambda
- Cache misses fall back to PostgreSQL query
- TTL not used - persistent leaderboard data

---

### 4. Realtime Layer

#### WebSocket Server

**Purpose**: Maintain persistent connections for real-time push notifications

**Key Responsibilities**:
- Accept WebSocket connections from clients with JWT authentication
- Maintain active connection pool (up to 50,000 concurrent connections)
- Subscribe to Redis pub/sub channel for leaderboard updates
- Broadcast leaderboard changes to all connected clients
- Handle connection lifecycle (connect, disconnect, errors, reconnects)
- Detect and close zombie connections (heartbeat mechanism)

**Message Types**:
- LEADERBOARD_UPDATE: New top 10 rankings
- CONNECTION_ACK: Connection established confirmation
- ERROR: Connection or authentication failures

**Broadcasting Strategy**:
- Only broadcast when top 10 actually changes (optimization)
- Sends formatted JSON with rankings, scores, and timestamp
- Failed sends automatically disconnect stale clients
- Supports thousands of simultaneous broadcasts

**Connection Management**:
- Authenticate connections using JWT token from query parameter
- Heartbeat every 30 seconds to detect dead connections
- Exponential backoff for client reconnection attempts
- Connection limits per user to prevent resource exhaustion

---

## Data Flow

### End-to-End Flow: User Action to Live Update

**Total Latency: ~90ms** from action completion to UI update across all clients

1. **User Completes Action**
   - User clicks action button in browser
   - Client sends POST request to /api/actions/complete with JWT token and action ID
   - Request includes authorization header with Bearer token

2. **API Gateway Processing**
   - Extracts JWT token from Authorization header
   - Verifies token signature and checks expiration
   - Extracts user context (userId, email, role)
   - Routes request to App Server

3. **Action Validation**
   - App Server validates action exists and is completable
   - Checks user hasn't already completed this action (idempotency)
   - Calculates score increment based on action difficulty (server-side calculation)
   - Prepares database transaction

4. **Database Update**
   - Begin transaction in PostgreSQL
   - Update user_scores table: increment total_score, update timestamp, increment version
   - Insert record into user_actions table to prevent duplicates
   - Commit transaction (both operations succeed or both fail)
   - Return new total score

5. **Event Publishing**
   - App Server publishes "ScoreUpdated" event to EventBridge
   - Event contains: userId, new score, increment, action ID, timestamp
   - EventBridge acknowledges receipt
   - Event delivery guaranteed by AWS

6. **Lambda Triggers**
   - EventBridge triggers Lambda function with event payload
   - Lambda connects to Redis ElastiCache cluster
   - Function executes leaderboard update logic

7. **Leaderboard Update in Redis**
   - Lambda fetches current top 10 from Redis Sorted Set
   - Updates user's score using ZADD command
   - Fetches new top 10 after update
   - Compares old vs new top 10
   - If changed: publishes notification to Redis pub/sub channel "leaderboard-updates"
   - If unchanged: no broadcast needed (optimization)

8. **WebSocket Broadcast**
   - WebSocket server receives pub/sub message from Redis
   - Formats leaderboard update message with top 10 rankings
   - Broadcasts to all connected clients (10,000-50,000 connections)
   - Each client receives update simultaneously
   - Failed sends disconnect stale clients

9. **Client UI Update**
   - Browser receives WebSocket message
   - Parses JSON payload with new top 10
   - Updates DOM with new rankings
   - Animates changes (e.g., highlight users who moved up/down)
   - User sees real-time update without any action

---



## API Specifications

### 1. Complete Action Endpoint

**POST /api/actions/complete**

**Description**: Records action completion and updates user score

**Authentication**: Required (JWT Bearer token)

**Rate Limit**: 100 requests per minute per user

**Request**:
```json
{
  "actionId": "uuid-or-action-identifier"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "newScore": 420,
    "increment": 10,
    "rank": 5,
    "message": "Action completed successfully"
  }
}
```

**Response (Error - 400)**:
```json
{
  "success": false,
  "error": "Action already completed or invalid"
}
```

**Response (Error - 429)**:
```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

### 2. Get Leaderboard Endpoint

**GET /api/leaderboard**

**Description**: Get current top 10 users (HTTP fallback for non-WebSocket clients)

**Authentication**: Optional

**Cache**: 5 seconds

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "top10": [
      {
        "rank": 1,
        "userId": "u456",
        "username": "ProGamer123",
        "score": 1000
      },
      {
        "rank": 2,
        "userId": "u123",
        "username": "CoolUser",
        "score": 420
      }
    ],
    "lastUpdated": "2026-01-14T10:30:00Z"
  }
}
```

---

### 3. Get User Rank Endpoint

**GET /api/leaderboard/user/:userId**

**Description**: Get specific user's rank and score

**Authentication**: Required (JWT Bearer token)

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "userId": "u123",
    "username": "CoolUser",
    "rank": 5,
    "score": 420,
    "inTop10": true,
    "distanceFromTop10": 0,
    "totalUsers": 1000
  }
}
```

---

### 4. WebSocket Connection

**Endpoint**: `wss://api.example.com/ws?token=<JWT_TOKEN>`

**Authentication**: JWT token via query parameter

**Messages from Server**:

**Type 1: Leaderboard Update**
```json
{
  "type": "LEADERBOARD_UPDATE",
  "data": {
    "top10": [
      {"rank": 1, "userId": "u456", "username": "ProGamer123", "score": 1000},
      {"rank": 2, "userId": "u123", "username": "CoolUser", "score": 420}
    ],
    "timestamp": "2026-01-14T10:30:00Z"
  }
}
```

**Type 2: Connection Acknowledged**
```json
{
  "type": "CONNECTION_ACK",
  "data": {
    "userId": "u123",
    "connectedAt": "2026-01-14T10:30:00Z"
  }
}
```

## Security Measures

### 1. **Authentication & Authorization**

- **JWT Tokens**: All requests must include valid JWT token
- **Token Expiration**: Tokens expire after 24 hours
- **Secure Token Storage**: Client stores tokens in httpOnly cookies or secure storage
- **Token Refresh**: Implement refresh token mechanism

### 5. **Monitoring Metrics**

Key metrics to track:
- **API Latency**: p50, p95, p99 response times
- **Score Update Rate**: Updates per second
- **WebSocket Connections**: Active connections count
- **Redis Performance**: Command latency, hit rate
- **Database Performance**: Query time, connection pool usage
- **Error Rate**: Failed requests, timeouts
- **Event Processing**: EventBridge to Redis latency

---

## Summary

This scoreboard module provides a production-ready, scalable solution for real-time leaderboard updates with the following key features:

✅ **Real-time updates** via WebSocket (< 100ms latency)
✅ **High performance** using Redis Sorted Sets (1000+ updates/sec)
✅ **Security** via JWT authentication and server-side validation
✅ **Scalability** with event-driven architecture and AWS services
✅ **Reliability** with fallbacks and graceful degradation
✅ **Monitoring** with comprehensive metrics and alerts

The architecture is designed to be:
- **Maintainable**: Clear separation of concerns, well-documented
- **Extensible**: Easy to add new features (multiple leaderboards, categories)
- **Cost-effective**: Efficient use of Redis and serverless components
- **Production-ready**: Includes monitoring, alerts, and disaster recovery

---

## Next Steps for Implementation Team

1. **Review this specification** and ask questions
2. **Set up development environment** (PostgreSQL, Redis, AWS accounts)
3. **Follow the 4-phase implementation plan** (4 weeks)
4. **Write tests first** (TDD approach recommended)
5. **Deploy to staging** for integration testing
6. **Load test** to validate performance targets
7. **Security audit** before production deployment
8. **Gradual rollout** with feature flags
