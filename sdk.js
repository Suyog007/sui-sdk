"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transactions_1 = require("@mysten/sui.js/transactions");
const ed25519_1 = require("@mysten/sui.js/keypairs/ed25519");
const client_1 = require("@mysten/sui.js/client");
const client = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('devnet') });
const addressToKeypair = new Map();
let tx = new transactions_1.TransactionBlock();
// create a keypair
const keypair = ed25519_1.Ed25519Keypair.deriveKeypair("refuse armor wish brown about table eight tool thank lecture simple vocal");
console.log(keypair);
// 1.  mint the nft to the above address 
// tx.moveCall({
//     target: '0xd400e22f339baae92cbd41e50e8bb7f5fc14f42210e10641a187283e37ca760e::nft::mint',
//     arguments: [ tx.pure.string("15th Nft of the package") ],
// })
const [coin] = tx.splitCoins(tx.gas, [1000000000]);
// transfer the split coin to a specific address
tx.transferObjects([coin], '0xe63826bf27e7e596e0842065559d3efbdcdb425cb2e20ea445cda0a4239ce3b6');
client.signAndExecuteTransactionBlock({ signer: keypair, transactionBlock: tx });
