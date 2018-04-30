/**
 * Created by yuanjianxin on 2018/4/18.
 */
const redis=require('redis');

module.exports=class _handler{

    static get instance(){
        if(!_handler._instance)
            _handler._instance=new _handler();
        return _handler._instance;
    }

    constructor(){
        this.client=null;
        this.host=null;
        this.port=null;
        this.password=null;
        this.reconnectTimeout=3600000;//重连超时时间
        this.retryTime=1000;//重试间隔时间
    }


    async init({host,port,password=null,reconnectTimeout=3600000,retryTime=100}){
        this.host=host;
        this.port=port;
        this.password=password;
        this.reconnectTimeout=reconnectTimeout;
        this.retryTime=retryTime;
        this.client=await this.createConnect();
    }


    createConnect(){
        let that=this;
        return new Promise((resolve,reject)=>{
            let connectConf={
                host:that.host,
                port:that.port,
                retry_strategy (options) {
                    if (options.error)
                        console.error('==Redis Error==',options.error.code);

                    if (options.total_retry_time > that.reconnectTimeout)
                        return new Error('Retry time exhausted');

                    that.client=null;
                    return that.retryTime;
                }
            };
            that.password && (connectConf.password=that.password);
            let client=redis.createClient(connectConf);

            client.on('connect',()=>{
                console.log('==Redis Connect Success!==')
                resolve(client);
            });

            client.on('error',err=>{
                console.error('==Redis Error!==',err);
                reject(err);
            });

            client.on('disconnect',()=>{
                console.error('==Redis Disconnect!==');
            });

        });
    }

    /**
     * 执行redis命令
     * @param command 命令
     * @param paras 参数
     * @returns {*}
     */
    exec(command,...paras){

        if(this.client==null){
            console.warn(`==Redis is Error==`);
            return null;
        }

        let client=this.client;
        return new Promise((resolve,reject)=>{
            client[command](...paras,(err,res)=>{
                err ? reject(err) : resolve(res);
            });
        });
    }
}