const username = "YOUREMAIL@HERE.COM";
const password = "YOURPASSWORD";

let token;
let blockchain;
let ulHistory;
let history;


async function newItem() {
    const item = document.getElementById("input").value;
    const ul = document.getElementById("list");
    const li = document.createElement("li");

    ulHistory = document.getElementById("history");
    li.appendChild(document.createTextNode(item));
    ul.appendChild(li);
    document.getElementById("input").value = "";
    li.onclick = removeItem;


    const token = await login();
    const blockchains = await getBlockchains(token);
    blockchain = blockchains[0];
    await addItemToBlockchain(token, blockchain.id, 'todoset', {ITEM: item, STATUS: 'TBD'});

    //update history
    await updateHistory();


}

document.body.onkeyup = function (e) {
    if (e.keyCode == 13) {
        newItem();
    }
};


const updateHistory = async () => {
    //remove all the history items
    while (ulHistory.firstChild) {
        ulHistory.removeChild(ulHistory.firstChild);
    }
    //reload history
    history = await getState(token,blockchain.id);
    //filter out only the done items
    history.filter((blockchainItem) => blockchainItem.state.STATUS === 'DONE')
        .map((blockchainItem) => {
            const liHistory = document.createElement("li");
            liHistory.appendChild(document.createTextNode(blockchainItem.state.ITEM));
            ulHistory.appendChild(liHistory);
        })
};

async function removeItem(e) {
    await addItemToBlockchain(token, blockchain.id, 'todoset', {ITEM: e.target.innerHTML, STATUS: 'DONE'});
    e.target.parentElement.removeChild(e.target);
    //We wait here, as the blockchain processes the updated Item
    setTimeout(function () {
        updateHistory();
    }, 2000);
}


const login = async () => {
    const login = await fetch(`https://api.hyperbeam.org/api/session/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
    const response = await login.json();
    return response.token;
};

const getBlockchains = async (token) => {
    const blockchains = await fetch(`https://api.hyperbeam.org/api/blockchain`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token
        }
    });
    return blockchains.json();
};

const getState = async(token,blockchainId) => {
    const blockchains = await fetch(`https://api.hyperbeam.org/api/blockchain/${blockchainId}/stateModel/todoset/stateItem`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token
        }
    });
    return blockchains.json();
};

const addItemToBlockchain = async (token, blockchainId, modelName, object) => {
    const itemAdd = await fetch(`https://api.hyperbeam.org/api/blockchain/${blockchainId}/stateModel/todoset/stateItem`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({
            objectKey: "dfezd",
            state: object
        })
    });
};