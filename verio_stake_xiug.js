import { ethers } from 'ethers';
import fs from 'fs'

import pLimit from 'p-limit';
const CONCURRENCY_LIMIT=5;


const iprpc="https://odyssey.storyrpc.io";
//RPC生成器
const RPC_provider=async(rpc)=>{
    let retries=0;
    let maxRetries=4;
    let provider=null;
    while (retries<maxRetries) {
      try {
          provider= new ethers.JsonRpcProvider(rpc);//设置链接PRC
          return provider;//设置链接PRC
      } catch (error) {
          retries++;
          console.error(`网络provider链接失败，开始尝试第${retries}次`);
          await sleep(2);
      } 
    }
    throw new Error("provider连接失败，达到最大重试次数");
  }
const provider=await RPC_provider(iprpc)
//打乱钱包顺序
function NewPrivatKeys(privateKeys) {
    // 用一个新数组来保存随机取出的数值
    let shuffled_PrivateKeys = [];
  
    // 随机取值直到取完所有数组元素
    while (privateKeys.length > 0) {
        // 生成一个随机索引
        let randomIndex = Math.floor(Math.random() * privateKeys.length);
        // 从原数组中取出随机的元素
        let randomNum = privateKeys[randomIndex];
        // 将取出的元素加入新数组
        shuffled_PrivateKeys.push(randomNum);
        // 从原数组中移除已经取出的元素
        privateKeys.splice(randomIndex, 1);
    }
    // console.log(shuffled_PrivateKeys);
    return shuffled_PrivateKeys;
  }

//16进制数据制造机器，0在前面
function formHexData(string) {
    if (typeof string !== 'string') {
        return '';
        throw new Error('Input must be a string.');
    }
  
    if (string.length > 64) {
        return '';
        throw new Error('String length exceeds 64 characters.');
    }
  
    return '0'.repeat(64 - string.length) + string;
  }
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
            console.error(`Error occurred: ${error.message}`);//暂时屏蔽掉错误信息
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
//睡眠
const  sleep = (seconds) => {
    let milliseconds = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  };

  /**
 * 读取 TXT 文件，并去掉每一行中的 \r 字符
 * @param {string} filePath - TXT 文件的路径
 * @returns {Promise<string[]>} - 返回一个包含每一行内容的数组
 */
  function readTxtFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject('读取文件出错: ' + err);
                return;
            }
            // 将文件内容按行分割成数组，并去掉每行的 \r 字符
            const lines = data.split('\n').map(line => line.replace(/\r/g, ''));
            resolve(lines);
        });
    });
  }

//IP存
async function verio_stakeIP(wallet){
    console.log(`存IP领取测试币。。。。。。。。。。。。。。。。。。。。。`);
    let value=Math.round(Math.random()*100)/400;
    if (value<=0.2) {
        value=0.2;
    }
    let txData = {
        to: '0x982bFbFF3F8f6db90A179eA4F2D776f679474B17', 
        data: `0x3a4b66f1`,
        value: ethers.parseEther(value.toString()),
    };
    console.log(`存了${value}个IP`);
    
    await walletSendtxData(wallet,txData);
    await sleep(3);
}

//吉祥物VIP存储  IPPY存储VIP
async function verio_stakeVIP(wallet){
    console.log(`存VIP领取测试币。。。。。。。。。。。。。。。。。。。。。`);
    let value=Math.round(Math.random()*100)/500;
    if (value<=0.1) {
        value=0.12;
    }
    // let value=0.1;
    let value_string=ethers.parseEther(value.toString());
    const value_hex=formHexData(BigInt(value_string).toString(16));
    const contract=`0x8b1e8a582edaE30a0b0fEd9ecb7F17C6C92959ba`;
    const stake_contract=[
        `0x78dF4B9d4F2AF91C28D7F57448041Cf18013Ad7A`,
        `0xcB3dE62262eF9f67A6Fcb11EF63B968F82eFAB74`,
        `0x35a8d320e1861DcB9f43e20Bf435a04A09f2b568`,
        `0x5F0B7a3253e5eFB00db18e77C99d58b183Fb409E`,
        `0xA5011126BC9d47AC6771521bF1e0801E71eac6Ee`,
        `0x16C470ecfdE917dAa20f37aA93600863c08DB17D`,
        `0xcB3dE62262eF9f67A6Fcb11EF63B968F82eFAB74`,
        `0x376928c1C44994A98621D80F88e1D783fbF60e84`
    ]
    const now_index=Math.floor(Math.random()*(stake_contract.length));
    //approve功能
    let txData = {
        to: '0xCADC3EA1c18c40159c8A4163E6892bF04B9D6f0a', 
        data: `0x095ea7b3${formHexData(contract.substring(2))}${value_hex}`,
        // data: `0x095ea7b3${formHexData(contract.substring(2))}${value_hex}`,
        value: 0,
    };
    // console.log(txData);
    
    await walletSendtxData(wallet,txData);
    await sleep(5);


    //存
    txData = {
        to: contract,
        data: `0x4a0f2f7a${formHexData(stake_contract[now_index].substring(2))}${"0".repeat(63)}1${value_hex}`,
        // data: `0x4a0f2f7a000000000000000000000000f78cb65a5c346c039215ed1fd3501e7cfdcf62200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000016345785d8a0000`,
        value: 0,
    };
    // console.log(txData);
    
    await walletSendtxData(wallet,txData);
    await sleep(3);
}

//领取水功能
async function piperx_facuet(wallet){
    console.log(`领取测试币。。。。。。。。。。。。。。。。。。。。。`);
    const WETH=`0x1C13B2B65d55dF06FF43528E736Db2F8e372E692`;
    const SUSDTToken=`0x02F75bdBb4732cc6419aC15EeBeE6BCee66e826f`;
    const SUSDC=`0x40fCa9cB1AB15eD9B5bDA19A52ac00A78AE08e1D`;
    const WBTC=`0x656afb1968bC39Cf3937f68CC6089F10cf47C1F7`;
    const tokens=[WETH,SUSDTToken,SUSDC,WBTC]
    for (let index = 0; index < tokens.length; index++) {
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
            let wallet=new ethers.Wallet(privateKey,provider);
            console.log(`地址：${wallet.address}`);
            const amount=await provider.getBalance(wallet.address);
            if (amount>0) {
                await verio_stakeIP(wallet); 
                await sleep(10);
                await verio_stakeVIP(wallet);                 
                await sleep(2);
                await piperx_facuet(wallet)     
                
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
    
main(NewPrivatKeys(await readTxtFile('D:/python/ethers/lesson/lesson-25-story/hhplume.txt'))).catch(error=>{
    console.error(error.message);  
})
