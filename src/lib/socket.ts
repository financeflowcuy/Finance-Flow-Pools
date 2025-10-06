import { Server } from 'socket.io';

<<<<<<< HEAD
// Global timer state
let globalTimer = {
  startTime: Date.now(),
  duration: 5 * 60 * 1000, // 5 minutes
  drawNumber: 1,
  isPaused: false,
  isMaintenance: false,
  maintenanceMessage: '',
  maintenanceStartTime: null as Date | null,
  pausedBy: '',
  pausedAt: null as Date | null,
  interval: null as NodeJS.Timeout | null
};

// Timer management functions
function startTimerBroadcast(io: Server) {
  if (globalTimer.interval) {
    clearInterval(globalTimer.interval);
  }

  globalTimer.interval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - globalTimer.startTime;
    const remaining = Math.max(0, globalTimer.duration - elapsed);

    // Broadcast timer update to all clients
    io.emit('timer_update', {
      remaining,
      duration: globalTimer.duration,
      drawNumber: globalTimer.drawNumber,
      isPaused: globalTimer.isPaused,
      isMaintenance: globalTimer.isMaintenance,
      maintenanceMessage: globalTimer.maintenanceMessage,
      maintenanceStartTime: globalTimer.maintenanceStartTime,
      pausedBy: globalTimer.pausedBy,
      pausedAt: globalTimer.pausedAt,
      nextDrawTime: globalTimer.startTime + globalTimer.duration
    });

    // If timer expired and not in maintenance, reset for next round
    if (remaining === 0 && !globalTimer.isPaused && !globalTimer.isMaintenance) {
      globalTimer.startTime = now;
      globalTimer.drawNumber++;
      
      // Broadcast new round started
      io.emit('new_round', {
        drawNumber: globalTimer.drawNumber,
        startTime: globalTimer.startTime
      });
    }
  }, 1000); // Update every second
}

export const setupSocket = (io: Server) => {
  // Start timer broadcasting
  startTimerBroadcast(io);
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current timer state immediately
    const now = Date.now();
    const elapsed = now - globalTimer.startTime;
    const remaining = Math.max(0, globalTimer.duration - elapsed);
    
    socket.emit('timer_update', {
      remaining,
      duration: globalTimer.duration,
      drawNumber: globalTimer.drawNumber,
      isPaused: globalTimer.isPaused,
      isMaintenance: globalTimer.isMaintenance,
      maintenanceMessage: globalTimer.maintenanceMessage,
      maintenanceStartTime: globalTimer.maintenanceStartTime,
      pausedBy: globalTimer.pausedBy,
      pausedAt: globalTimer.pausedAt,
      nextDrawTime: globalTimer.startTime + globalTimer.duration
    });

    // Handle timer control from admin
    socket.on('timer_control', (data: { action: string, duration?: number, message?: string, adminName?: string }) => {
      const { action, duration, message, adminName } = data;
      const adminNameFromHeader = adminName || 'Admin';
      
      switch (action) {
        case 'pause':
          globalTimer.isPaused = true;
          globalTimer.pausedBy = adminNameFromHeader;
          globalTimer.pausedAt = new Date();
          break;
          
        case 'resume':
          globalTimer.isPaused = false;
          globalTimer.pausedBy = '';
          globalTimer.pausedAt = null;
          if (duration) {
            globalTimer.startTime = Date.now() - (globalTimer.duration - duration);
          }
          break;
          
        case 'reset':
          globalTimer.startTime = Date.now();
          globalTimer.drawNumber++;
          globalTimer.isPaused = false;
          globalTimer.isMaintenance = false;
          globalTimer.maintenanceMessage = '';
          globalTimer.maintenanceStartTime = null;
          globalTimer.pausedBy = '';
          globalTimer.pausedAt = null;
          break;
          
        case 'setDuration':
          const elapsed = Date.now() - globalTimer.startTime;
          globalTimer.duration = duration || globalTimer.duration;
          globalTimer.startTime = Date.now() - elapsed;
          break;
          
        case 'startMaintenance':
          globalTimer.isMaintenance = true;
          globalTimer.maintenanceMessage = message || 'Sistem sedang dalam perbaikan';
          globalTimer.maintenanceStartTime = new Date();
          globalTimer.isPaused = true;
          globalTimer.pausedBy = adminNameFromHeader;
          globalTimer.pausedAt = new Date();
          break;
          
        case 'endMaintenance':
          globalTimer.isMaintenance = false;
          globalTimer.maintenanceMessage = '';
          globalTimer.maintenanceStartTime = null;
          globalTimer.isPaused = false;
          globalTimer.pausedBy = '';
          globalTimer.pausedAt = null;
          break;
          
        case 'updateMaintenanceMessage':
          globalTimer.maintenanceMessage = message || globalTimer.maintenanceMessage;
          break;
      }
      
      // Broadcast updated timer state
      const newElapsed = Date.now() - globalTimer.startTime;
      const newRemaining = Math.max(0, globalTimer.duration - newElapsed);
      
      io.emit('timer_update', {
        remaining: newRemaining,
        duration: globalTimer.duration,
        drawNumber: globalTimer.drawNumber,
        isPaused: globalTimer.isPaused,
        isMaintenance: globalTimer.isMaintenance,
        maintenanceMessage: globalTimer.maintenanceMessage,
        maintenanceStartTime: globalTimer.maintenanceStartTime,
        pausedBy: globalTimer.pausedBy,
        pausedAt: globalTimer.pausedAt,
        nextDrawTime: globalTimer.startTime + globalTimer.duration
      });
      
      // Broadcast maintenance status change
      if (action === 'startMaintenance') {
        io.emit('maintenance_started', {
          message: globalTimer.maintenanceMessage,
          startedBy: adminNameFromHeader,
          startTime: globalTimer.maintenanceStartTime
        });
      } else if (action === 'endMaintenance') {
        io.emit('maintenance_ended', {
          endedBy: adminNameFromHeader
        });
      }
    });
    
=======
export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
    // Handle messages
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
<<<<<<< HEAD
      text: 'Welcome to Batik Pools Live Draw!',
=======
      text: 'Welcome to WebSocket Echo Server!',
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};