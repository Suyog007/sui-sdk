import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { type Keypair } from '@mysten/sui.js/cryptography';


const client = new SuiClient({ url: getFullnodeUrl('devnet') });


const addressToKeypair = new Map<string, Keypair>();

let tx = new TransactionBlock();

// create a keypair
const keypair = Ed25519Keypair.deriveKeypair("refuse armor wish brown about table eight tool thank lecture simple vocal");
// address = 0x36306131687cf3eea75cf05e17d4919a3d0c605f462591e652834015f466fe1d

// this is the nft contract published
let nftStruct = '0x68d2ab8cde466f9b7b2868b3b4cb3c73982a3525687477e74d98581b63b83996::nft::Nft';

// 1.  mint the nft to the above address 
tx.moveCall({
    target: '0x68d2ab8cde466f9b7b2868b3b4cb3c73982a3525687477e74d98581b63b83996::nft::mint',
    arguments: [ tx.pure.string("166th Nft of the package") ],
})

// 2.  create a kiosk for the above address,
let item = tx.moveCall({
    target: '0x2::kiosk::default'
});

// function for sleep
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

let result;
let digest_:string;
let objectIDs: any;
async function executeTransaction() {
    try {
	  // signing the transaction for minting nft and creating kiosk
      result = await client.signAndExecuteTransactionBlock({ signer: keypair, transactionBlock: tx });
      digest_ = result.digest; 
      objectIDs = await getCreatedObject();
	  console.log(objectIDs);

	  await sleep(10000); // Sleep for 10000 milliseconds (10 seconds)

	  // creating a new transactionBlock for place and list
	  let txb = new TransactionBlock();

      let itemObj = txb.object(objectIDs[2]);
	  let kioskArg = txb.object(objectIDs[0]);
	  let kioskOwnerCapArg = txb.object(objectIDs[1]);

	  // placing and listing the items on created kiosk
      txb.moveCall({
            target: '0x2::kiosk::place_and_list',
            arguments: [ kioskArg, kioskOwnerCapArg, itemObj , txb.pure(10000)],
            typeArguments: [ nftStruct ]
        })
	  // signing the transaction for place_and_list
	  await client.signAndExecuteTransactionBlock({ signer: keypair, transactionBlock: txb });

    } catch (error) {
      // Handle potential errors if the promise rejects
      console.error(error);
    }
  }

executeTransaction();

async function getCreatedObject() {
    try {
        if (!digest_) {
            console.log("Digest is not available");
            return;
        }

        const txn = await client.getTransactionBlock({
            digest: String(digest_),
            // only fetch the effects and objects field
            options: {
                showEffects: true,
                showInput: false,
                showEvents: false,
                showObjectChanges: true,
                showBalanceChanges: false,
            },
        });      
        let output:any;
        let kioskOwnerCapId;
        let kioskID;
        let nftID;
        output = txn.objectChanges;

        for (let i = 0; i < output.length; i++) {
            const item = output[i];
			// if there is created field in the type, we extract the objectID of required type
            if (item.type === 'created') {
                if (item.objectType === '0x2::kiosk::KioskOwnerCap') {
                    kioskOwnerCapId = String(item.objectId);
                } else if (item.objectType === nftStruct) {
                    nftID = String(item.objectId);
                } else if (item.objectType === '0x2::kiosk::Kiosk') {
                    kioskID = String(item.objectId);
                }
            }
        }

        return [kioskID, kioskOwnerCapId, nftID];
        
    } catch (error) {
      // Handle potential errors if the promise rejects
      console.error(error);
    }
  }


