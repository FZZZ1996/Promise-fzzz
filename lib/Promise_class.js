/* 
自定义Promise函数模块:IIFE
 */
(function (window) {

  class Promise {
    /* 
    Promise构造函数
    excutor:执行器函数（同步执行）
    */
    constructor(excutor) {
      //将当前promise对象保存起来
      const self = this;
      self.status = 'pending'; //给promise对象指定status属性，初始值为pending
      self.data = undefined; //给promise对象指定一个用于存储结果数据的属性
      self.callbacks = []; //每个元素的结构：{onResolved(){},onRejected(){}}

      /* 
      两个用于改变状态的回调函数
      */
      //经过调试可以发现，在这个函数里写的this，如果直接写，会成为Window类型，因为resolve()是直接被调用的
      function resolve(value) {
        //如果当前状态不是pending，直接结束
        if (self.status !== 'pending') {
          return
        }
        //将状态改为resolved
        self.status = 'resolved';
        //保存value数据
        self.data = value;
        //如果有待执行的callback函数，立即异步执行回调函数onResolved
        if (self.callbacks.length > 0) {
          setTimeout(() => {
            self.callbacks.forEach(callbacksObj => {
              callbacksObj.onResolved(value);
            });
          })
        }
      }

      function reject(reason) {
        //如果当前状态不是pending，直接结束
        if (self.status !== 'pending') {
          return
        }
        //将状态改为rejected
        self.status = 'rejected';
        //保存value数据
        self.data = reason;
        //如果有待执行的callback函数，立即异步执行回调函数onResolved
        if (self.callbacks.length > 0) {
          setTimeout(() => {
            self.callbacks.forEach(callbacksObj => {
              callbacksObj.onRejected(reason);
            });
          })
        }
      }

      //立刻同步执行excutor
      try {
        excutor(resolve, reject)
      } catch (error) { //如果执行器抛出异常，promise对象变为rejected状态
        reject(error)
      }
    }

    /* 
      Promise原型对象的then()
      指定成功和失败的回调函数
      返回一个新的promise对象,这个才是难点,返回的promise的结果由onResolved/onRejected的执行结果决定
      */
    then(onResolved, onRejected) {
      onResolved = typeof onResolved === 'function' ? onResolved : value => value;//向后传递成功的value
      //指定默认的失败的回调（实现错误/异常传透的关键点）
      onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };//向后传递失败的reason
      const self = this;
      return new Promise((resolve, reject) => {
        //在这个里面到底调用resolve还是reject，看onResolved或onRejected执行的结果
        //调用resolve，返回的promise对象就是成功的，调用reject，返回的promise对象就是失败的

        /* 
        封装的调用指定的回调函数处理，根据执行结果，改变return的promise的状态
        */
        function handle(callback) {
          /* 
          下面的这个callback回调函数有几种情况
          1.如果抛出异常，return的promise就会失败，reason就是error
          2.如果回调函数返回不是promise，return的promise就会成功，value就是返回的值
          3.如果回调函数返回的是promise，return的promise结果就是这个promise的结果
          */
          try {
            const result = callback(self.data);
            if (result instanceof Promise) {
              //result是个promise对象，我怎么知道result的结果到底是成功还是失败的，只能去调用result.then，看看到底进到哪个回调里面去
              result.then(
                value => { resolve(value) }, //当result成功时，让return的promise也成功，下面也一样
                reason => { reject(reason) }
              )
              //上面更简洁的写法
              //result.then(resolve,reject);
            } else {
              resolve(result)
            }
          } catch (error) {
            reject(error);
          }
        }

        if (self.status === 'pending') {
          //当前状态是pending状态，就将回调函数先保存起来
          self.callbacks.push({
            onResolved(value) { //为啥要这么写，因为到时候不仅要执行onResolved回调函数，还要改变返回的promise的状态，仅仅执行onResolved回调函数是没法改变的，下面也一样
              handle(onResolved);
            },
            onRejected(reason) {
              handle(onRejected);
            }
          })
        } else if (self.status === 'resolved') { //如果当前是resolved状态，异步执行onResolved并改变return的promise状态
          //回调函数要异步执行
          setTimeout(() => {
            handle(onResolved);
          })
        } else { //如果当前是rejected状态，异步执行onRejected并改变return的promise状态
          //回调函数要异步执行
          setTimeout(() => {
            handle(onRejected);
          })
        }
      })
    }

    /* 
    Promise原型对象的catch()
    指定失败的回调函数
    返回一个新的promise对象
    */
    catch(onRejected) {
      return this.then(undefined, onRejected);
    }

    /* 
    Promise函数对象的resolve()
    返回一个指定结果的成功的promise
    */
    static resolve = function (value) {
      //返回一个成功/失败的promise
      return new Promise((resolve, reject) => {
        //value是promise
        if (value instanceof Promise) {//使用value的结果作为promise的结果
          value.then(resolve, reject);
        } else {//value不是promise，promise变为成功，数据是value
          resolve(value);
        }
      })
    }

    /* 
    Promise函数对象的reject()
    返回一个指定结果的失败的promise
    */
    static reject = function (reason) {
      //返回一个失败的promise
      return new Promise((resolve, reject) => {
        reject(reason);
      })
    }

    /* 
    Promise函数对象的all()
    返回一个promise，只有当所有promise都成功时才成功，否则只要有一个失败的就算失败
    */
    static all = function (promises) {
      //用来保存所有成功value的数组
      const values = new Array(promises.length);
      //用来保存成功promise的数量
      let resolvedCount = 0;
      return new Promise((resolve, reject) => {
        //遍历promises获取每个promise的结果
        promises.forEach((p, index) => {
          Promise.resolve(p) //为什么要在p的外面包装一层，这样可以保证p就算是一个数字也可以正常使用
            .then(value => {
              resolvedCount++;
              values[index] = value;
              //如果全部成功了，将return的promise变为成功
              if (resolvedCount === promises.length) {
                resolve(values);
              }
            }, reason => {//只要一个失败了，return的promise就失败
              reject(reason)
            })
        })
      })
    }

    /* 
    Promise函数对象的race()
    返回一个promise，其结果由第一个完成的promise决定
    */
    static race = function (promises) {
      return new Promise((resolve, reject) => {
        //遍历promises获取每个promise的结果
        promises.forEach((p, index) => {
          Promise.resolve(p) //为什么要在p的外面包装一层，这样可以保证p就算是一个数字也可以正常使用
            .then(value => {//一旦有成功的，将return成功
              resolve(value);
            }, reason => {//一旦有失败的，将return失败
              reject(reason)
            })
        })
      })
    }

    /* 
    自定义
    返回一个promise对象，它在指定的时间后才确定结果
    */
    static resolveDelay = function (value, time) {
      //返回一个成功/失败的promise
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          //value是promise
          if (value instanceof Promise) {//使用value的结果作为promise的结果
            value.then(resolve, reject);
          } else {//value不是promise，promise变为成功，数据是value
            resolve(value);
          }
        }, time)
      })
    }

    /* 
    自定义
    返回一个promise对象，它在指定的时间后才失败
    */
    static rejectDelay = function (reason, time) {
      //返回一个失败的promise
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(reason);
        }, time)
      })
    }
  }
  //向外暴露Promise函数
  window.Promise = Promise;
})(window)