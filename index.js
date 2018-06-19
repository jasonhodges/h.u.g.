module.exports = robot => {
  robot.on('status', async context => {
    context.log(context.payload)
  })
};
