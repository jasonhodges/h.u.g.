module.exports = robot => {
  robot.on('status', async context => {
      robot.log('Branch Name:', context.payload.branches[0].name)
    const branchRegex = /([0-9]*\d)/g;
    const branchNum = branchRegex.exec(context.payload.branches[0].name);
    if (context.payload.state === 'success') {
      const params = context.issue({number: branchNum, labels: [{name: "CI:Passed"}]});
      return context.github.issues.edit(params)
    } else if (context.payload.state === 'error' || context.payload.state === 'failed') {
      // robot.log('Context State:', context.payload.state)
      const params = context.issue({number: branchNum, labels: [{name: "CI:Failed"}]});
      return context.github.issues.edit(params)
    }
  })
};
