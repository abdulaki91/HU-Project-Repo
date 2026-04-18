#!/bin/bash

# SSH Tunnel Management Script for Remote MySQL Database
# Usage: ./ssh-tunnel.sh [start|stop|status|restart]

TUNNEL_HOST="abdulaki.com"
TUNNEL_PORT="1219"
TUNNEL_USER="abdulaki"
LOCAL_PORT="3307"
REMOTE_PORT="3306"
PIDFILE="/tmp/mysql-tunnel.pid"

start_tunnel() {
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
        echo "SSH tunnel is already running (PID: $(cat $PIDFILE))"
        return 1
    fi
    
    echo "Starting SSH tunnel to $TUNNEL_HOST..."
    echo "Local port $LOCAL_PORT -> Remote port $REMOTE_PORT"
    
    # Start SSH tunnel in background
    ssh -f -N -L $LOCAL_PORT:localhost:$REMOTE_PORT -p $TUNNEL_PORT $TUNNEL_USER@$TUNNEL_HOST
    
    if [ $? -eq 0 ]; then
        # Get the PID of the SSH process
        PID=$(ps aux | grep "ssh.*$LOCAL_PORT:localhost:$REMOTE_PORT" | grep -v grep | awk '{print $2}')
        echo $PID > "$PIDFILE"
        echo "SSH tunnel started successfully (PID: $PID)"
        echo "You can now connect to MySQL on localhost:$LOCAL_PORT"
    else
        echo "Failed to start SSH tunnel"
        return 1
    fi
}

stop_tunnel() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat "$PIDFILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "Stopping SSH tunnel (PID: $PID)..."
            kill "$PID"
            rm -f "$PIDFILE"
            echo "SSH tunnel stopped"
        else
            echo "SSH tunnel process not found, cleaning up PID file"
            rm -f "$PIDFILE"
        fi
    else
        echo "SSH tunnel is not running"
    fi
}

status_tunnel() {
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
        PID=$(cat "$PIDFILE")
        echo "SSH tunnel is running (PID: $PID)"
        
        # Check if port is listening
        if netstat -an 2>/dev/null | grep -q ":$LOCAL_PORT.*LISTEN" || lsof -i :$LOCAL_PORT >/dev/null 2>&1; then
            echo "Port $LOCAL_PORT is listening"
            
            # Test MySQL connection
            echo "Testing MySQL connection..."
            if command -v mysql >/dev/null 2>&1; then
                mysql -h localhost -P $LOCAL_PORT -u abdulaki_abdulaki --connect-timeout=5 -e "SELECT 1;" abdulaki_student_results 2>/dev/null
                if [ $? -eq 0 ]; then
                    echo "✅ MySQL connection successful"
                else
                    echo "❌ MySQL connection failed"
                fi
            else
                echo "MySQL client not installed, cannot test connection"
            fi
        else
            echo "❌ Port $LOCAL_PORT is not listening"
        fi
    else
        echo "SSH tunnel is not running"
        return 1
    fi
}

restart_tunnel() {
    echo "Restarting SSH tunnel..."
    stop_tunnel
    sleep 2
    start_tunnel
}

case "$1" in
    start)
        start_tunnel
        ;;
    stop)
        stop_tunnel
        ;;
    status)
        status_tunnel
        ;;
    restart)
        restart_tunnel
        ;;
    *)
        echo "Usage: $0 {start|stop|status|restart}"
        echo ""
        echo "Commands:"
        echo "  start   - Start SSH tunnel to remote MySQL server"
        echo "  stop    - Stop SSH tunnel"
        echo "  status  - Check tunnel status and test MySQL connection"
        echo "  restart - Restart SSH tunnel"
        echo ""
        echo "Configuration:"
        echo "  Remote: $TUNNEL_USER@$TUNNEL_HOST:$TUNNEL_PORT"
        echo "  Tunnel: localhost:$LOCAL_PORT -> remote:$REMOTE_PORT"
        exit 1
        ;;
esac