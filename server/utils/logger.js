function logEvent(eventType, payload) {
  // Structured logging for event-driven architecture visibility.
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      eventType,
      payload
    })
  );
}

module.exports = { logEvent };
