const RP = require('request-promise');
const issueHelpers = require('./duplicateIssues');
let currentIssues;
const getAllIssues = RP({
  uri: "https://api.waffle.io/projects/5b293bd3b375920031f9602e/cards?access_token=eMunnCMns25U5Xg9yRAYu37oIh83HAtcOqwHcyop",
  headers: {
    Accept: "application/vnd.waffle.v1+json"
  },
  json: true
})
  .then(res => {
    currentIssues = res;
  });

module.exports = robot => {
  robot.on('issues.opened', async context => {
    const issue = context.payload.issue;
    const issueMatches = currentIssues.reduce((acc, currentIssue) => {
      const issueMatch = issueHelpers.findSimilarIssue(issue, currentIssue);
      if (issueMatch !== null) {
        acc.push(issueMatch);
      }
      return acc;
    }, []);
    const comment = issueMatches.reduce((acc, match) => {
        acc = acc + `This likely related to ${match.url} \n`;
        return acc;
      }, '');
    currentIssues.push(issue);
    issueHelpers.postAComment(issue, comment);
  })
  robot.on('status', async context => {
    context.log(context.payload)
      robot.log('Branch Name:', context.payload.branches[0].name);
    const branchRegex = /([0-9]*\d)/g;
    const branchNum = branchRegex.exec(context.payload.branches[0].name)[0];
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
  })
};
