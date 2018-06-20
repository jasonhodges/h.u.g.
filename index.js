const RP = require('request-promise');\
const isSimilarIssue = (issues, issue) => {

}

const getAllIssues = RP({
  uri: "https://api.waffle.io/projects/5b293bd3b375920031f9602e/cards?access_token=eMunnCMns25U5Xg9yRAYu37oIh83HAtcOqwHcyop",
  headers: {
    Accept: "application/vnd.waffle.v1+json"
  },
  json: true
})
  .then(res => {
    console.log(res)
  });

module.exports = robot => {
  robot.on('status', async context => {
      robot.log('Branch Name:', context.payload.branches[0].name)
    const branchRegex = /(\#([0-9]*))/g;
    const branchNum = branchRegex.exec(context.payload.branches[0].name);
    robot.log(`Branch number: ${branchNum}`);
    if (context.payload.state === 'success') {
      const params = context.issue({number: branchNum, labels: [{name: "CI:Passed"}]});
      return context.github.issues.edit(params)
    } else if (context.payload.state === 'error' || context.payload.state === 'failed') {
      // robot.log('Context State:', context.payload.state)
      const params = context.issue({number: branchNum, labels: [{name: "CI:Failed"}] });
      return context.github.issues.edit(params)
    }
  })
  robot.on('issues.opened', async context => {
    const issues = await getAllIssues();
  })
};
