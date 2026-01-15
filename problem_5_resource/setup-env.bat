@echo off

REM Resource Management Environment Setup Script for Windows

if "%1"=="local" goto setup_local
if "%1"=="docker" goto setup_docker
if "%1"=="help" goto show_help
if "%1"=="" goto show_help

echo ❌ Invalid option: %1
echo.
goto show_help

:setup_local
echo Setting up local development environment...
copy .env.local .env >nul
echo Copied .env.local to .env
echo Make sure you have PostgreSQL running locally
echo You can now run: npm run dev
goto end

:setup_docker
echo Setting up Docker environment...
docker-compose up --build
echo Copied .env.docker to .env
echo You can now run: docker-compose up --build
goto end

:show_help
echo Usage: %0 [local^|docker^|help]
echo.
echo Commands:
echo   local   - Set up local development environment
echo   docker  - Set up Docker environment
echo   help    - Show this help message
echo.
echo Examples:
echo   %0 local    # Set up for local development
echo   %0 docker   # Set up for Docker development

:end
