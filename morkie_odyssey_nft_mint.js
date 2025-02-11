import { ethers } from 'ethers';
import { PrivateKeys$18Wallets, PrivateKeys$136Wallets,PrivateKeys$153Wallets } from '../../util/privateKey.js';
import { RPC_provider,formHexData, sleep,NewPrivatKeys} from '../../util/common.js';
import RPC from '../../config/runnerRPC-1.json' assert { type: 'json' };
import { wallet_create } from '../../util/wallet_create.js';

import pLimit from 'p-limit';
const CONCURRENCY_LIMIT=5;
const provider=await RPC_provider(RPC.iprpc)

  /**
   * 钱包发送交易程序，简化程序代码；
   * maxRetries为最大的尝试次数，默认是3次；
   * timeout为最大的时间周期,默认是10s，合约交互时间较长
   */

  async function walletSendtxData(wallet,txData,maxRetries = 4,timeout=50000){
    let retries = 0;
    let success = false;
    while (retries < maxRetries) {
        try {
            const txPromise = wallet.sendTransaction(txData);
            const transactionResponse= await Promise.race([
                txPromise,
                new Promise((_,reject)=>setTimeout(()=>reject(new Error('TimeOut')),timeout))                
            ]);
            const receipt = await transactionResponse.wait();
            if (receipt.status===1) {
              console.log("交易sucess，hash是:",receipt.hash); 
              retries=maxRetries;
              success=true;
            }else{
              throw new Error(`交易hash是failed，从新进行交易`);              
            }
            await sleep(2)         
            return 0;
        } catch (error) {
            // console.error(`Error occurred: ${error.message}`);//暂时屏蔽掉错误信息
            retries++;
            // console.error(`开始尝试第${retries}次,${error.message}`);
            console.error(`开始尝试第${retries}次`);
            if(retries >= maxRetries){
              console.log(`尝试${maxRetries}次仍然失败，退出交易`);
              // console.error(`kayakfinance领取测试币发生错误,开始尝试第${retries}次`);
              return 1;
                // throw new Error('Max retries exceeded'); 
            }
            await sleep(1);//等待3s时间
        }         
    }
}
//获取代币的

async function poster_nft_mint(wallet){
    const address_contract=`0xF2fD4dd6F001295Bd1431fA6A918Ca95840da106`;
    const abi_contract=[
        {
            "inputs": [
              {
                "internalType": "address",
                "name": "_receiver",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "_quantity",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "_currency",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "_pricePerToken",
                "type": "uint256"
              },
              {
                "components": [
                  {
                    "internalType": "bytes32[]",
                    "name": "proof",
                    "type": "bytes32[]"
                  },
                  {
                    "internalType": "uint256",
                    "name": "quantityLimitPerWallet",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "pricePerToken",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "currency",
                    "type": "address"
                  }
                ],
                "internalType": "struct IDrop.AllowlistProof",
                "name": "_allowlistProof",
                "type": "tuple"
              },
              {
                "internalType": "bytes",
                "name": "_data",
                "type": "bytes"
              }
            ],
            "name": "claim",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          }
    ];
    // const  nftMetadataURI = 'https://ipfs.io/ipfs/bafkreibyi63qjtxmqnneozowyix7popnfpkqztm7ydjtpsj5zhl7f5n2oe'
    const mint_data=[
      [],
      "0",
      "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      "0x0000000000000000000000000000000000000000"
    ];
    try {
        const contract=new ethers.Contract(address_contract,abi_contract,wallet);
        const txResponse=contract.claim(wallet.address,1,`0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`,ethers.parseEther(`0.5`),mint_data,`0x`);
        await walletContract(txResponse);
        await sleep(1);
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
    }   
}

  /**
   * 钱包合约交易程序，简化程序代码；
   * maxRetries为最大的尝试次数，默认是3次；
   * timeout为最大的时间周期,默认是10s，合约交互时间较长
   * 验证发送交易是否真正成功，sucsess
   * txReceipt合约获得参数
   */

  async function walletContract(txPromise,maxRetries = 4,timeout=25000){
    let retries = 0;
    let success = false;
    // let timeout=timeout;
    while (retries < maxRetries && !success) {
        try {
            // const contract=new ethers.Contract(contract.address,contract.abi,wallet);
            const transactionResponse= await Promise.race([
              // await txPromise.wait(),
              txPromise,
              new Promise((_,reject)=>setTimeout(()=>reject(new Error('TimeOut')),timeout))                
            ]);
            // 等待交易交易结果
            const receipt = await transactionResponse.wait();
            if (receipt.status===1) {
              console.log("合约交易sucess，hash是:",receipt.hash); 
              retries=maxRetries;
              success=true;
              return receipt.hash;
            }else{
              throw new Error(`合约交易hash是failed，从新进行交易`);              
            }
            await sleep(2)          
        } catch (error) {
            retries++;
            console.error(`开始尝试第${retries}次,${error.message}`);
            console.error(`合约交易开始尝试第${retries}次`);
            if(retries >= maxRetries){
              console.log(`合约交易尝试${maxRetries}次仍然失败，退出合约交易`);
              return null;
            }
            await sleep(1);//等待1s时间
        }         
    }
}

const main=async(privateKeys)=>{
    console.log(`当前时间点是：${new Date()}`);

    const limit = pLimit(CONCURRENCY_LIMIT);
    const tasks=privateKeys.map(privateKey=>
        limit(async ()=>{
            let wallet=new ethers.Wallet(privateKey,provider);
            console.log(`地址：${wallet.address}`);
            // console.log(`第${index+1}个钱包，地址：${Plume_wallet.address}`);
            const amount=await provider.getBalance(wallet.address)
            if (amount >0) {
                await sleep(5)
                await poster_nft_mint(wallet)     
            }
        })
     );
     await Promise.allSettled(tasks)
     .then(()=>
         console.log(`任务已完成`)
     )
     .catch(error=>{
         console.error(error.message);
     });
     
}
    
main(NewPrivatKeys(PrivateKeys$18Wallets.slice(0,1))).catch(error=>{
    console.error(error.message);  
})

// main(wallet_create.slice(0,100)).catch(error=>{
//     console.error(error.message);  
// })
//循环获取数量
// const shuffled_PrivateKeys=NewPrivatKeys(privateKeys);
// for (let index = 0; index < privateKeys.length; index++) {//shuffled_PrivateKeys.length
//     const morphl2_wallet=new ethers.Wallet(privateKeys[index],morphl2_Provider);
//     const address=morphl2_wallet.address;
//     console.log(`第${index+1}个钱包，钱包地址是:${address}`);
//     await claimMOCKToken(morphl2_wallet) 
// }

