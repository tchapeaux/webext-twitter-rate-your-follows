function getScore(votes) {
  let sum = 0;
  Object.values(votes).forEach((val) => (sum += val));
  return sum;
}

async function clearDataFor(username) {
  await browser.storage.local.remove(username);

  fetchData();
}

async function fetchData() {
  const data = await browser.storage.local.get(null);

  const dataTable = document.getElementById("data-table");
  const dataTBody = document.getElementById("data-tbody");
  const emptyMsg = document.getElementById("empty-msg");

  if (Object.keys(data).length === 0) {
    dataTable.style.visibility = "hidden";
    emptyMsg.style.visibility = "visible";
  } else {
    dataTable.style.visibility = "visible";
    emptyMsg.style.visibility = "hidden";
  }

  dataTBody.innerHTML = "";
  Object.keys(data)
    .sort(
      (author1, author2) => getScore(data[author1]) - getScore(data[author2])
    )
    .forEach((author) => {
      const authorDataRow = document.createElement("tr");
      authorDataRow.classList = ["data-row"];

      const scoreCell = document.createElement("td");
      const score = getScore(data[author]);
      scoreCell.innerHTML = String(score);
      if (score < 0) {
        scoreCell.classList = ["negative-score"];
      }
      if (score > 0) {
        scoreCell.classList = ["positive-score"];
      }

      const usernameCell = document.createElement("td");
      usernameCell.innerHTML = `<a href="https://twitter.com/${author}">${author}</a>`;

      const deleteBtnCell = document.createElement("td");
      const clearBtn = document.createElement("button");
      clearBtn.classList = ["clear-btn"];
      clearBtn.innerHTML = "♻";
      clearBtn.addEventListener("click", async () => clearDataFor(author));
      deleteBtnCell.appendChild(clearBtn);

      authorDataRow.appendChild(scoreCell);
      authorDataRow.appendChild(usernameCell);
      authorDataRow.appendChild(deleteBtnCell);

      dataTBody.appendChild(authorDataRow);
    });
}

const clearAllBtn = document.getElementById("btn-clear-all-data");
clearAllBtn.addEventListener("click", async () => {
  await browser.storage.local.clear();
  fetchData();
});

fetchData();
