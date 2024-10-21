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


async function piperx_facuet(wallet){
    const WETH=`0x968B9a5603ddEb2A78Aa08182BC44Ece1D9E5bf0`;
    const SUSDTToken=`0x8812d810EA7CC4e1c3FB45cef19D6a7ECBf2D85D`;
    const SUSDC=`0x700722D24f9256Be288f56449E8AB1D27C4a70ca`;
    const WBTC=`0x153B112138C6dE2CAD16D66B4B6448B7b88CAEF3`;
    const tokens=[WETH,SUSDTToken,SUSDC,WBTC]
    for (let index = 0; index < tokens.length; index++) {
        // console.log(`领取${tokens[index]}试币。。。。。。。。。。。。。。。。。。。。。`);
        let txData = {
            to: tokens[index], 
            data: `0x9f678cca`,
            value: 0
        };
        await walletSendtxData(wallet,txData);
        await sleep(3);     
    }
}
const main=async(privateKeys)=>{
    console.log(`当前时间点是：${new Date()}`);

    const limit = pLimit(CONCURRENCY_LIMIT);
    const tasks=privateKeys.map(privateKey=>
        limit(async ()=>{
            let wallet=new ethers.Wallet(privateKey,await RPC_provider(RPC.iprpc));
            console.log(`地址：${wallet.address}`);
            // console.log(`第${index+1}个钱包，地址：${Plume_wallet.address}`);
            await piperx_facuet(wallet) 
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
    
main(PrivateKeys$18Wallets.slice(0)).catch(error=>{
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

