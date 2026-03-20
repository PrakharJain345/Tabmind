const { verifyToken } = require('./jwt');

let _io = null;

/**
 * Initialize the io instance. Called once from index.js.
 * @param {import('socket.io').Server} io
 */
function initSocket(io) {
  _io = io;

  // Middleware: authenticate using JWT from handshake.
  // The dashboard sends: io(URL, { auth: { token } })
  // This middleware runs before 'connection', rejecting unauthorized sockets immediately.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }
    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.id.toString();
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Authenticated by middleware — join user's private room immediately
    socket.join(socket.userId);
    console.log(`[Socket.io] User ${socket.userId} connected and joined room`);
    socket.emit('authenticated', { success: true });

    socket.on('disconnect', () => {
      if (socket.userId) {
        console.log(`[Socket.io] User ${socket.userId} disconnected`);
      }
    });
  });
}

/**
 * Returns the Socket.io server instance.
 * @returns {import('socket.io').Server}
 */
function getIO() {
  if (!_io) throw new Error('Socket.io not initialized. Call initSocket(io) first.');
  return _io;
}

/**
 * Emit an event to a specific user's room.
 * @param {string} userId
 * @param {string} event
 * @param {*} data
 */
function emitToUser(userId, event, data) {
  if (!_io) return; // silently skip if not initialized (e.g. in tests)
  _io.to(userId.toString()).emit(event, data);
}

module.exports = { initSocket, getIO, emitToUser };
