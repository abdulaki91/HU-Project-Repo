@echo off
REM SSH Tunnel Management Script for Remote MySQL Database (Windows)
REM Usage: ssh-tunnel.bat [start|stop|status|restart]

set TUNNEL_HOST=abdulaki.com
set TUNNEL_PORT=1219
set TUNNEL_USER=abdulaki
set LOCAL_PORT=3307
set REMOTE_PORT=3306
set PIDFILE=%TEMP%\mysql-tunnel.pid

if "%1"=="start" goto start_tunnel
if "%1"=="stop" goto stop_tunnel
if "%1"=="status" goto status_tunnel
if "%1"=="restart" goto restart_tunnel
goto usage

:start_tunnel
if exist "%PIDFILE%" (
    echo SSH tunnel may already be running
    echo Check with: ssh-tunnel.bat status
    goto end
)

echo Starting SSH tunnel to %TUNNEL_HOST%...
echo Local port %LOCAL_PORT% -^> Remote port %REMOTE_PORT%

REM Start SSH tunnel in background
start /B ssh -N -L %LOCAL_PORT%:localhost:%REMOTE_PORT% -p %TUNNEL_PORT% %TUNNEL_USER%@%TUNNEL_HOST%

if %ERRORLEVEL% EQU 0 (
    echo SSH tunnel started successfully
    echo You can now connect to MySQL on localhost:%LOCAL_PORT%
    echo %DATE% %TIME% > "%PIDFILE%"
) else (
    echo Failed to start SSH tunnel
)
goto end

:stop_tunnel
echo Stopping SSH tunnel...
REM Kill SSH processes related to our tunnel
taskkill /F /IM ssh.exe 2>nul
if exist "%PIDFILE%" del "%PIDFILE%"
echo SSH tunnel stopped
goto end

:status_tunnel
if exist "%PIDFILE%" (
    echo SSH tunnel appears to be running
    echo Started: 
    type "%PIDFILE%"
    
    REM Check if port is listening
    netstat -an | findstr ":%LOCAL_PORT%" >nul
    if %ERRORLEVEL% EQU 0 (
        echo Port %LOCAL_PORT% is listening
        
        REM Test MySQL connection if mysql client is available
        where mysql >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo Testing MySQL connection...
            mysql -h localhost -P %LOCAL_PORT% -u abdulaki_abdulaki --connect-timeout=5 -e "SELECT 1;" abdulaki_student_results 2>nul
            if %ERRORLEVEL% EQU 0 (
                echo ✅ MySQL connection successful
            ) else (
                echo ❌ MySQL connection failed
            )
        ) else (
            echo MySQL client not found, cannot test connection
        )
    ) else (
        echo ❌ Port %LOCAL_PORT% is not listening
    )
) else (
    echo SSH tunnel is not running
)
goto end

:restart_tunnel
echo Restarting SSH tunnel...
call :stop_tunnel
timeout /t 2 /nobreak >nul
call :start_tunnel
goto end

:usage
echo Usage: %0 {start^|stop^|status^|restart}
echo.
echo Commands:
echo   start   - Start SSH tunnel to remote MySQL server
echo   stop    - Stop SSH tunnel
echo   status  - Check tunnel status and test MySQL connection
echo   restart - Restart SSH tunnel
echo.
echo Configuration:
echo   Remote: %TUNNEL_USER%@%TUNNEL_HOST%:%TUNNEL_PORT%
echo   Tunnel: localhost:%LOCAL_PORT% -^> remote:%REMOTE_PORT%

:end