module.exports = robot => {
  robot.on('status', async context => {
    context.log('Status Payload: ', context.payload)
  })
};
