const RP = require('request-promise');
async function getIssueLabels(context, issueNum) {
  const params = context.issue({number: issueNum});
  const labels = await context.github.issues.getIssueLabels(params);
  console.log('---------------------------Labels: ', labels);
  return labels;
}

const getAllIssues = RP({
  uri: "https://api.waffle.io/projects/5b293bd3b375920031f9602e/cards?access_token=eMunnCMns25U5Xg9yRAYu37oIh83HAtcOqwHcyop",
  headers: {
    Accept: "application/vnd.waffle.v1+json"
  },
  json: true
}).then(res => {
    console.log(res)
  });

module.exports = robot => {
  robot.on('status', async context => {
      robot.log('Branch Name:', context.payload.branches[0].name);
    // const branchRegex = /(\#([0-9]*))/g;
    const branchRegex = /([0-9]*\d)/g;
    const branchNum = branchRegex.exec(context.payload.branches[0].name);
    robot.log(`Branch number: ${branchNum}`);
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
  });
  robot.on('issues.opened', async context => {
    const issues = await getAllIssues();
  })
};

