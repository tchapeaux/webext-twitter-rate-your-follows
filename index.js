const FROWN = "frown";
const SMILE = "smile";

function getButtonId(author, tweetId, action) {
  return `tchap-btn-${author}-${tweetId}-${action}`;
}

function applyButtonStyle(node, hasVoted, isActive) {
  node.style.backgroundColor = isActive ? "yellow" : "transparent";
  node.style.opacity = hasVoted ? 0.7 : 1;
  node.style.border = "none";
  node.style.width = "50px";
  node.style.cursor = "pointer";
}

async function registerVote(author, tweetId, voteValue) {
  const data = await browser.storage.local.get(author);

  if (!data[author]) {
    data[author] = {};
  }

  const newData = {
    ...data,
    [author]: {
      ...data[author],
      [tweetId]: voteValue,
    },
  };

  await browser.storage.local.set(newData);

  // Compute total score
  let sumScore = 0;
  Object.values(newData[author]).forEach((val) => (sumScore += val));
  console.log("Set", author, "vote value to", sumScore);

  // Update button style
  const btnFrownId = getButtonId(author, tweetId, FROWN);
  const btnFrown = document.getElementById(btnFrownId);
  applyButtonStyle(btnFrown, true, voteValue === -1);
  const btnSmileId = getButtonId(author, tweetId, SMILE);
  const btnSmile = document.getElementById(btnSmileId);
  applyButtonStyle(btnSmile, true, voteValue === 1);
}

async function tick() {
  // Fetch visible tweets in the page
  // There is one `article` element by tweet, so we parse that
  const tweets = document.getElementsByTagName("article");

  // console.log("Found", tweets.length, "tweets");

  for (const tweet of tweets) {
    // Fetch the followed user that caused this tweet to appear
    // This will be either the tweet author or the one who retweeted it
    // This is always the href of the first link in the tweet
    const _links = tweet.getElementsByTagName("a");
    const author = _links[0];
    const authorUsername = author.href.replace(/^.*twitter\.com\//, "");
    // console.log("Found author", author.href);

    // Fetch tweet timestamp
    // This will be used to identify it uniquely for this author
    // There might be multiple times per tweet, so we take the first one
    const time = tweet.getElementsByTagName("time")[0].dateTime;
    const tweetId = time;

    // Fetch button state
    // In case the user already voted on this tweet
    const data = await browser.storage.local.get(authorUsername);
    const prevVote = data?.[authorUsername]?.[tweetId] || 0;
    const hasVoted = !!prevVote;

    // Add button to visible tweets
    // First remove previous buttons then add new ones
    const tweetButtons = tweet.querySelectorAll("[id^=tchap-btn]");
    tweetButtons.forEach((btn) => btn.remove());

    const optionsBar = tweet.querySelectorAll('[role="group"]')[0];
    const hasButtons = optionsBar.firstChild.tagName.match(/button/i);
    if (!hasButtons) {
      const newFrownButton = document.createElement("button");
      newFrownButton.id = getButtonId(authorUsername, tweetId, FROWN);
      newFrownButton.addEventListener(
        "click",
        function () {
          registerVote(authorUsername, tweetId, -1);
        },
        false
      );
      applyButtonStyle(newFrownButton, hasVoted, prevVote === -1);
      newFrownButton.innerHTML = "🙁";
      optionsBar.insertBefore(newFrownButton, optionsBar.firstChild);

      const newSmileButton = document.createElement("button");
      newSmileButton.id = getButtonId(authorUsername, tweetId, SMILE);
      newSmileButton.addEventListener(
        "click",
        function () {
          registerVote(authorUsername, tweetId, 1);
        },
        false
      );
      applyButtonStyle(newSmileButton, hasVoted, prevVote === 1);
      newSmileButton.innerHTML = "😊";
      optionsBar.insertBefore(newSmileButton, optionsBar.firstChild);
    }
  }

  window.setTimeout(() => tick(), 1000);
}

tick();
