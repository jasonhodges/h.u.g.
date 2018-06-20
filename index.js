const RP = require('request-promise');

async function getIssueLabels(context, issueNum) {
  const params = context.issue({number: issueNum});
  const labels = await context.github.issues.getIssueLabels(params);
  console.log('---------------------------Labels: ', labels);
  return labels;
}

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
    const issues = await getAllIssues;
  })
};

async function getAllIssues () {
  console.log('get all issues')
  RP({
    uri: "https://api.waffle.io/projects/5b293bd3b375920031f9602e/cards?access_token=eMunnCMns25U5Xg9yRAYu37oIh83HAtcOqwHcyop",
    headers: {
      Accept: "application/vnd.waffle.v1+json"
    },
    json: true
  }).then(res => {
    res.map(issue => {
      console.log(issue.githubMetadata)
      if (new Date(issue.githubMetadata.updated_at) < new Date(new Date().getTime() - (5 * 60000))) {
        console.log(issue.githubMetadata.labels)
        issue.githubMetadata.labels.filter((x) => x.name !== "old 🖤" || x.name !== "stale 💔");
        return updateGithubTicketsById(issue.githubMetadata, "aging 💜")
      }
      if (new Date(issue.githubMetadata.updated_at) < new Date(new Date().getTime() - (10 * 60000))) {
        console.log(issue.githubMetadata.labels)
        issue.githubMetadata.labels.filter((x) => x.name !== "aging 💜" || x.name !== "stale 💔");
        return updateGithubTicketsById(issue.githubMetadata, "old 🖤")
      }
      if (new Date(issue.githubMetadata.updated_at) < new Date(new Date().getTime() - (20 * 60000))) {
        console.log(issue.githubMetadata.labels)
        issue.githubMetadata.labels.filter((x) => x.name !== "aging 💜" || x.name !== "old 🖤");
        return updateGithubTicketsById(issue.githubMetadata, "stale 💔")
      }
    })
  });
}

async function updateGithubTicketsById(issue, label) {

  RP({
    uri: `https://api.github.com/repos/jasonhodges/h.u.g./issues/${issue.number}`,
    method: "PATCH",
    headers: {
      "User-Agent": "h.u.g.",
      Accept: "application/vnd.github.symmetra-preview+json",
      'Host': 'api.github.com',
      'Authorization': 'Basic ' + new Buffer("jet0316" + ':' + "guitar01").toString('base64')
    },
    body: {
      labels: [
        ...issue.labels,
        label
      ]
    },
    json: true
  })
    .then(res => {
      // console.log(res)
    })

}

async function addWaffleEmoji() {

}

getAllIssues();
// getAllGithubIssues();
