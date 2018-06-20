async function getIssueLabels(context, issueNum) {
  const params = context.issue({number: issueNum});
  const labels = await context.github.issues.getIssueLabels(params);
  console.log('---------------------------Labels: ', labels);
  return labels;
}

module.exports = robot => {
  robot.on('status', async context => {
    robot.log('Branch Name:', context.payload.branches[0].name);
    const branchRegex = /([0-9]*\d)/g;
    const branchNum = branchRegex.exec(context.payload.branches[0].name);
    if (context.payload.state === 'success') {
      const labelParams = context.issue({number: branchNum});
      const labels = await context.github.issues.getIssueLabels(labelParams);
      const filteredLabels = labels.data.filter((l) => {
        return !/CI:/.test(l.name);
      });
      robot.log('---------------------------Filtered Labels: ', filteredLabels);
      const newLabels = [...filteredLabels, {name: "CI:Passed"}];
      const params = context.issue({number: branchNum, labels: newLabels});
      return context.github.issues.edit(params)
    } else if (context.payload.state === 'error' || context.payload.state === 'failed') {
      const labelParams = context.issue({number: branchNum});
      const labels = await context.github.issues.getIssueLabels(labelParams);
      const filteredLabels = labels.data.filter((l) => {
        return !/CI:/.test(l.name);
      });
      robot.log('---------------------------Filtered Labels: ', filteredLabels);
      const newLabels = [...filteredLabels, {name: "CI:Failed"}];
      const params = context.issue({number: branchNum, labels: newLabels});
      return context.github.issues.edit(params)
    }
  })
};

