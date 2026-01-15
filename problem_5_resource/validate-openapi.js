#!/usr/bin/env node

/**
 * OpenAPI Specification Validator
 * 
 * This script validates the openapi.yml file for syntax errors and completeness.
 * Run with: node validate-openapi.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const OPENAPI_FILE = path.join(__dirname, 'openapi.yml');

function validateOpenAPI() {
    console.log('🔍 Validating OpenAPI specification...\n');
    
    try {
        // Check if file exists
        if (!fs.existsSync(OPENAPI_FILE)) {
            throw new Error('openapi.yml file not found');
        }
        
        // Read and parse YAML
        const yamlContent = fs.readFileSync(OPENAPI_FILE, 'utf8');
        const openApiDoc = yaml.load(yamlContent);
        
        // Basic validation checks
        const checks = [
            {
                name: 'OpenAPI version',
                test: () => openApiDoc.openapi === '3.0.3',
                message: 'OpenAPI version should be 3.0.3'
            },
            {
                name: 'Info section',
                test: () => openApiDoc.info && openApiDoc.info.title && openApiDoc.info.version,
                message: 'Info section must have title and version'
            },
            {
                name: 'Paths section',
                test: () => openApiDoc.paths && Object.keys(openApiDoc.paths).length > 0,
                message: 'Paths section must exist and have at least one path'
            },
            {
                name: 'Components section',
                test: () => openApiDoc.components && openApiDoc.components.schemas,
                message: 'Components section must exist with schemas'
            },
            {
                name: 'Resource endpoints',
                test: () => {
                    const paths = Object.keys(openApiDoc.paths);
                    return paths.includes('/resources') && 
                           paths.includes('/resources/{id}') && 
                           paths.includes('/resources/stats');
                },
                message: 'Must include all resource endpoints'
            },
            {
                name: 'HTTP methods',
                test: () => {
                    const resourcePath = openApiDoc.paths['/resources'];
                    const resourceIdPath = openApiDoc.paths['/resources/{id}'];
                    return resourcePath.get && resourcePath.post &&
                           resourceIdPath.get && resourceIdPath.put && resourceIdPath.delete;
                },
                message: 'Must include all required HTTP methods'
            }
        ];
        
        let passed = 0;
        let failed = 0;
        
        checks.forEach(check => {
            try {
                if (check.test()) {
                    console.log(`✅ ${check.name}`);
                    passed++;
                } else {
                    console.log(`❌ ${check.name}: ${check.message}`);
                    failed++;
                }
            } catch (error) {
                console.log(`❌ ${check.name}: ${error.message}`);
                failed++;
            }
        });
        
        console.log(`\n📊 Validation Results:`);
        console.log(`   ✅ Passed: ${passed}`);
        console.log(`   ❌ Failed: ${failed}`);
        
        if (failed === 0) {
            console.log(`\n🎉 OpenAPI specification is valid!`);
            console.log(`📁 File: ${OPENAPI_FILE}`);
            console.log(`📄 Endpoints documented: ${Object.keys(openApiDoc.paths).length}`);
            console.log(`🏷️ Schemas defined: ${Object.keys(openApiDoc.components.schemas).length}`);
            process.exit(0);
        } else {
            console.log(`\n❌ OpenAPI specification has issues that need to be fixed.`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error(`❌ Error validating OpenAPI specification:`, error.message);
        process.exit(1);
    }
}

// Run validation
validateOpenAPI();
