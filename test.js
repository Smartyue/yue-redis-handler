/**
 * Created by yuanjianxin on 2018/4/18.
 */

let config={
    host:'127.0.0.1',
    port:'6379'
}

const Sleep=(time)=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>resolve(),time);
    })
}

function AsyncAll(...invokes)
{
    if(invokes.length === 0)
        new Promise((resolve,reject)=>resolve([]));
    invokes = invokes.reduce( (r,v) =>{Array.isArray(v) ? r.push(...v) : r.push(v);return r},[] )
    return new Promise((resolve,reject)=>Promise.all(invokes)
        .then(results=>resolve(results)).catch(e=>reject(e)))

}

const handler=require('./index');

(
    async ()=>{
        await handler.instance.init(config);
        while (true){
            let res=await handler.instance.exec('get','test');
            console.log('===res',res);
            await Sleep(3000);
        }
    }
)();
