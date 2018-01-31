
export default class RiotControlHandlerKeeper{

    constructor(controller){
        this.controller     = controller;
        this.handlers       = [];
    }

    on(eventName,fn){
        this.controller.on(eventName,fn);
        this.handlers.push({eventName,fn});
    }

    offAll(){
        this.handlers.forEach((handler)=>{
            try{
                this.controller.off(handler.eventName,handler.fn);
            }catch(e){console.error(e)}
        });
        this.handlers.length = 0;
    }

    trigger(...params){
        this.controller.trigger(...params);
    }
}
