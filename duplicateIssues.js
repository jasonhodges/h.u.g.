const RP = require('request-promise');
const MIN_MATCH_PERCENTAGE = 0.5;
const postAComment = (issue, comment) => {
  RP({
    uri: `https://api.github.com/repos/jasonhodges/h.u.g./issues/${issue.number}/comments`,
    method: "POST",
    headers: {
      "User-Agent": "h.u.g.",
      Accept: "application/vnd.github.symmetra-preview+json",
      'Host': 'api.github.com',
      'Authorization': 'Basic ' + new Buffer("jet0316" + ':' + "guitar01").toString('base64')
    },
    body: {
      body: comment
    },
    json: true
  })
    .then(res => {
      console.log(res)
    })
}
const ISSUE_URL = 'https://github.com/jasonhodges/h.u.g./issues/'
const trimIssue = (issue) => ({
    id: issue.id,
    title: issue.title.toLowerCase().split(' '),
    number: issue.number
});
const trimGithubMetadataIssue = (issue) => {
  return ({
      id: issue.githubMetadata.id,
      title: issue.githubMetadata.title.toLowerCase().split(' '),
      number: issue.githubMetadata.number
  })
}
const findSimilarIssue = (issueA, issueB) => {
  const trimmedIssueA = trimIssue(issueA);
  const trimmedIssueB = trimGithubMetadataIssue(issueB);
  const length = trimmedIssueA.title.length;
  const hits = trimmedIssueA.title.reduce((acc, word) => {
    trimmedIssueB.title.forEach(wordB => {
      if (wordB === word) {
        acc += 1;
      }
    });
    return acc;
  }, 0);
  return (hits / length) >= MIN_MATCH_PERCENTAGE
    ? {
      number: issueB.number,
      url: `${ISSUE_URL}${trimmedIssueB.number}`
    }
    : null
};

module.exports = {
    findSimilarIssue,
    postAComment
};
