module.exports = robot => {
  robot.on('status', async context => {
    if (context.payload.state === 'success') {
      // robot.log('Context State:', context.payload.state)
      const params = context.issue({number: 5, labels: [{name: "CI:Passed"}]});
      return context.github.issues.edit(params)
    } else if (context.payload.state === 'error' || context.payload.state === 'failed') {
      // robot.log('Context State:', context.payload.state)
      const params = context.issue({number: 5, labels: [{name: "CI:Failed"}]});
      return context.github.issues.edit(params)
    }
  })
};
