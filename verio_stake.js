import { ethers } from 'ethers';
import { PrivateKeys$18Wallets, PrivateKeys$136Wallets } from '../../util/privateKey.js';
import { RPC_provider,formHexData, sleep,NewPrivatKeys} from '../../util/common.js';
import RPC from '../../config/runnerRPC-1.json' assert { type: 'json' };
import { wallet_create } from '../../util/wallet_create.js';

import pLimit from 'p-limit';
const CONCURRENCY_LIMIT=5;

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


async function verio_stakeIP(wallet){
    console.log(`存IP领取测试币。。。。。。。。。。。。。。。。。。。。。`);
    let value=Math.round(Math.random()*100)/500;
    if (value<=0.1) {
        value=0.1;
    }
    let txData = {
        to: '0x846892532878a8b1b91fb51887E72759c9D43EE7', 
        data: `0x3a4b66f1`,
        value: ethers.parseEther(value.toString()),
    };
    // console.log(txData);
    
    await walletSendtxData(wallet,txData);
    await sleep(3);
}
const main=async(privateKeys)=>{
    console.log(`当前时间点是：${new Date()}`);

    const limit = pLimit(CONCURRENCY_LIMIT);
    const tasks=privateKeys.map(privateKey=>
        limit(async ()=>{
            let wallet=new ethers.Wallet(privateKey,await RPC_provider(RPC.iprpc));
            console.log(`地址：${wallet.address}`);
            // console.log(`第${index+1}个钱包，地址：${Plume_wallet.address}`);
            await verio_stakeIP(wallet) 
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
    
main(NewPrivatKeys(PrivateKeys$18Wallets).slice(0)).catch(error=>{
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

