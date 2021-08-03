# 准备工作

## 实例对象和函数对象

 ```javascript
 function Fn(){
 
 }
 const fn=new Fn();//fn是实例对象，简称为对象
 console.log(Fn.prototype);//Fn是函数对象，将一个函数作为对象使用
 
 ```

你写在括号的左边的东西肯定是函数，比如你写`a()`，那我们知道a肯定是个函数。在点的左边，必然是对象。

看到代码，你要知道数据类型，先看懂语法，再看懂功能。

## 两种类型的回调函数  同步回调和异步回调

什么样的函数是回调函数？要三个条件同时满足：

1. 回调函数要是你自己定义的
2. 回调函数我没有亲自调用
3. 但是他最后执行了

```javascript
//同步回调函数
const arr=[1,3,5];
arr.forEach(item=>{ //这就是同步回调函数，不会放入队列，执行完了才会执行后面的
  console.log(item); //他先打印
});
console.log('forEach()之后'); //他后打印

//异步回调函数
setTimeout(()=>{ //这就是异步回调函数，会放入队列中将来执行
    console.log('aaa'); //他后打印
},0);
console.log('bbb'); //他先打印
```

## JS中的error处理

### 常见的内置错误

1. ReferenceError 引用的变量不存在
2. TypeError 数据类型不正确的错误
3. RangeError 数据值不在其所允许的范围内
4. SyntaxError 语法错误

错误不捕获，下面的代码不会执行

### 错误的处理（捕获与抛出）

捕获用try ... catch

```javascript
try{
  let d;
  console.log(d.xxx);
} catch (error){  //在这里有个调试的技巧，如果你不知道error里有什么属性，可以在这行打个断点，然后运行到这里时，在source里鼠标hover上去就可以看到
  console.log(error.message);
}
console.log('出错之后');  //在这行就能输出了，因为错误被处理了
```

抛出错误 throw error 自己去抛出的

``` javascript
function something(){
  if(Date.now()%2===1){
    console.log('111');
  } else {  //如果时间是偶数，抛出异常，由调用者来处理
    throw new Error('222');
  }
}
try {
  something();
} catch (error) {
  console.log(error.message);
}
```

# promise的理解和使用

学技术的基本流程，拿到一个新东西，**这个东西是什么？为什么要用这个？怎么用这个？**前两个绝对不能忘，语法可以忘

## promise是什么

承诺将来给你一个数据，只不过成功的数据还是失败的数据我一开始不知道

讲抽象一点：是js中执行异步编程的新的解决方案，旧的是纯回调的形式，为啥要说纯，因为promise里也有回调

讲具体一点：Promise是一个构造函数，promise对象用来封装一个异步操作并可以获取其结果

## promise的状态改变

1. pending变为resolved
2. pending变为rejected

**只有**这两种变化，而且一个promise对象只能改变一次，无论是变为成功还是失败，都会有一个结果数据

## promise的基本流程

新建一个promise对象，new Promise()，这个promise对象是pending状态，这个promise在创建的时候要传进去参数，参数是函数（启动异步任务的函数），执行异步任务成功，就执行resolve()，promise对象会变成resolved状态，一旦变成这个状态，就会去调用成功的回调函数，then()可以指定成功和失败的回调函数；执行异步任务失败，就执行reject()，promise对象会变成rejected状态，一旦变成这个状态，就会去调用失败的回调函数，catch()可以指定失败的回调函数；then()和catch()都会返回新的promise对象。

## promise的基本使用

你要好好理解下“返回一个promise”这句话是什么意思

```javascript
const p=new Promise((resolve,reject)=>{  //执行器函数，同步回调，执行异步操作任务
  setTimeout(()=>{
    const time=Date.now();
    if(time%2==0){
      resolve('succcess');
    }
    else{
      reject('fail');
    }
  },1000)
});
p.then(
  //成功的回调函数
  value=>{  //value不是我自己去取的，而是他自己交给我的，下面的reason也一样
    
  },
  //失败的回调函数
  reason=>{
  
  }
)
```

## 为什么要用promise

假设现在有一个名为 `createAudioFileAsync()` 的函数，它接收一些配置和两个回调函数，然后异步地生成音频文件。一个回调函数在文件成功创建时被调用，另一个则在出现异常时被调用。

```javascript
// 成功的回调函数
function successCallback(result) {
  console.log("音频文件创建成功: " + result);
}

// 失败的回调函数
function failureCallback(error) {
  console.log("音频文件创建失败: " + error);
}

//以前你就要这么写,你必须在你真正执行异步操作前就要指定好成功和失败的回调函数,你是先指定了回调函数，后启动了异步任务
createAudioFileAsync(audioSettings, successCallback, failureCallback)

//用promise就这么写
//如果已经得到了一个promise对象，异步任务肯定是已经启动了，做没做完我先不管
const promise = createAudioFileAsync(audioSettings);
promise.then(successCallback, failureCallback);
//而且就算你这个异步任务执行需要2s，而我是在3s之后才给你指定了then的回调函数，我一样可以正常执行回调
//也就是说我可以在你异步任务执行完成之后才指定回调函数，异步任务启动和执行完成是两码事，不要搞混
```

也就是说promise相对于传统的纯回调函数的第一个优势在于**指定回调函数的方式更加灵活**，promise：启动异步任务=》返回promise对象=》给promise对象指定回调函数

接下来是第二个优势，**promise支持链式调用，可以解决回调地狱问题，其实回调地狱的终极解决方法是async,await，因为这两个就没有回调函数了**

```javascript
//先搞第一个，再搞第二个，后一个异步任务依赖前一个异步任务的结果的场景
//纯回调函数嵌套调用，不便于阅读，也不便于异常处理
doSomething(function(result) {
  doSomethingElse(result, function(newResult) {
    doThirdThing(newResult, function(finalResult) {
      console.log('Got the final result: ' + finalResult);
    }, failureCallback);
  }, failureCallback);
}, failureCallback);

//用promise就这么写了
doSomething().then(function(result) {
  return doSomethingElse(result);  //这一行好好看
})
.then(function(newResult) {
  return doThirdThing(newResult);
})
.then(function(finalResult) {
  console.log('Got the final result: ' + finalResult);
})
.catch(failureCallback); //如果上面三个任何一个出了异常，都会跳到这里，异常传透
```

```javascript
async function foo() {
  try {
    const result = await doSomething();
    const newResult = await doSomethingElse(result);
    const finalResult = await doThirdThing(newResult);
    console.log(`Got the final result: ${finalResult}`);
  } catch(error) {
    failureCallback(error);
  }
}
```

## Promise如何使用

语法上不要有障碍，感觉看不懂自己想办法

API自己去看MDN

`Promise.prototype.then()`方法返回一个新的promise对象

```javascript
new Promise((resolve,reject)=>{ //你也不是非得叫这两个名字，可以随便取
 
})

// 产生一个成功值或失败值为几几几的promise对象，你要是以前就要这么写
const p1=new Promise((resolve,reject)=>{
    resolve(1);
})
//现在有语法糖，写起来就简单多了
const p2=Promise.resolve(2);
const p3=Promise.reject(3);

p1.then(value=>{console.log(value)});
p2.then(value=>{console.log(value)});
p3.catch(reason=>{console.log(reason)});

const pAll=Promise.all([p1,p2,p3]);
pAll.then(
  values=>{},
  reason=>{
      console.log(reason); //3
  }
)

const pRace=Promise.race([p1,p2,p3]);
```

## Promise的几个关键问题

1.如何改变promise的状态？除了resolve(value)和reject(reason)，还可以**抛出异常**，如果当前是pendding，就会变成rejected

```javascript
const p=new Promise((resolve,reject)=>{
  throw new Error('aaa');  //reason为抛出的error
  //你直接抛出一个3都行
  //throw 3; reason为3
})
```

2.一个promise指定多个成功/失败的回调函数，都会调用吗？

   是的

```javascript
//promise改变为对应状态时都会调用的
p.then(
  value=>{...},
  reason=>{...}
)
p.then(
  value=>{...},
  reason=>{...}
)
```

3.改变promise状态和指定回调函数谁先谁后？

  都有可能，你先指定回调函数或者先改变promise状态都行。

```javascript
new Promise((rosolve,reject)=>{
  setTimeout(()=>{
    resolve(1);  //后改状态(同时指定了数据)，异步指定回调函数，问题是他到时候怎么知道回调函数在哪？
  },1000)
}).then(  //先指定回调函数  所以在这里会先保存当前指定的回调函数
  value=>{},
  reason=>{console.log(reason)}
)

//先改状态再指定回调，可以在执行器中直接调用resolve()/reject()，或者延迟更长时间才调用then()
new Promise((rosolve,reject)=>{
    resolve(1);  //先改状态(同时指定了数据)，这时候是把状态存起来
}).then(  //后指定回调函数，异步执行回调函数,注意：then是同步，then里面的回调函数是异步执行
  value=>{},
  reason=>{console.log(reason)}
)
```

4.promise.then()返回的新promise的结果状态由什么决定？

 （插一句，then可以串联多个操作任务，这是他的一个用途）

 简单说：由then()指定的回调函数执行的结果决定

 详细说：（1） 如果抛出异常，新promise变为rejected，reason为抛出的异常，你抛出啥，后面的就接啥，不管抛出的是Error对象还是一个数字

​               （2） 如果返回的是非promise的任意值，新promise变为resolved，value为返回的值（比如你在then里写同步操作就可以这么写）

​               （3）如果返回的是一个新的promise，此promise的结果就会成为新promise的结果（比如你在then里写异步操作就可以这么写）

```javascript
new Promise((resolve,reject)=>{
  resolve(1)
}).then(
  value=>{
    console.log(value);
    //return 2;
    //return Promise.resolve(3);
    //return Promise.reject(4);
    //throw 5;
  },
  reason=>{
    console.log(reason);
  }
).then(
  value=>{console.log(value)},
  reason=>{console.log(reason)}
)
```

5.链式调用，每个链就只看他前面的的一环返回的是个啥，不要越级看；而且，你不要把then/catch本身和里面指定的函数搞混了，不是说catch返回的东西就一定    是失败的promise，要看他里面写的函数到底返回的是个啥

6.promise异常传透

 异常传透不是一步跳过去的，也是一级一级传过去的

```javascript
new Promise((resolve,reject)=>{
  reject(1)
}).then(
  value=>{
    console.log(value);
  },
  // reason=>{throw reason} 其实我在这里没写失败的处理函数，但是相当于写了
).then(
 value=>{
    console.log(value);
  },
  // 这里省略了，其实跟上面一样
).catch( // 这样就会一级一级传过来
  reason=>{
    console.log(reason);
  }
)
```

7.中断promise链怎么中断？

 ```javascript
 new Promise((resolve,reject)=>{
   reject(1)
 }).then(
   value=>{
     console.log(value);
   }
 ).catch(
  reason=>{ 
     console.log(reason);
     //如果我在这里不想往下传了
     return new Promise(()=>{}) //返回一个pending状态的promise
   }
 ).then( // 就不会调用这里的回调
   value=>{
     console.log(value);
   }
 )
 ```

# 手写Promise

见代码

# async与await

```javascript
//async函数的返回值是promise对象
//这个promise对象的结果由async函数执行的返回值决定
async function fn1(){
  //return 1;
  //throw 2;
  return Promise.resolve(3);
}

const result=fn1();
result.then(
  value=>{
      console.log('onResolved()',value);
  },
  reason=>{
      console.log('onRejected()',reason);
  }
)

function fn2(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve(5);
        },1000)
    })
}

async function fn3(){
    //await所在的函数必须声明为async，但是async函数中可以没有await
    try{ //如果await的promise失败，就会抛出异常，需要通过try...catch来捕获处理
        const value=await fn2();// await右边跟表达式，取到的value就是promise里成功的数据
        //const value=await 3;//await右边也可以不写promise，得到的结果就是表达式的结果
    }catch(error){
        console.log('得到失败的结果',error);
    }
}
fn3();
```

# 宏队列和微队列

宏队列：dom事件回调，ajax回调，定时器回调

微队列：promise回调，mutation回调

将所有的同步代码执行完以后，才会去执行队列里面的回调函数，每次准备取出第一个宏任务执行前，都要将所有的微任务一个一个取出来执行。

