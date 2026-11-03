/** Smoke-test the offline preview with a DOM stub; Node.js only, no npm packages. */
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const map=new Map(),dom={innerHTML:'',textContent:''};
const ctx={
 document:{querySelector(){return dom},querySelectorAll(){return[]},createElement(){return {className:'',textContent:'',remove(){}}},body:{appendChild(){}}},
 localStorage:{getItem(k){return map.get(k)||null},setItem(k,v){map.set(k,v)}},
 location:new Proxy({hash:'#home'},{set(o,k,v){o[k]=k==='hash'&&!String(v).startsWith('#')?'#'+v:v;return true}}),
 window:{scrollTo(){},addEventListener(){}},setTimeout(){},console,
 FormData:class{constructor(e){return Object.entries(e.__fields)}}, navigator:{clipboard:{writeText(){}}}
};
ctx.globalThis=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),ctx);
const run=x=>vm.runInContext(x,ctx);
assert.match(dom.innerHTML,/Making every event/);
run('navigate("services")'); assert.match(dom.innerHTML,/Popcorn Machine/);assert.match(dom.innerHTML,/Candy Floss Machine/);
run('navigate("detail/4")'); assert.match(dom.innerHTML,/Popcorn Machine/);
run('add(4)'); assert.match(dom.innerHTML,/booking cart/);
run('navigate("book")'); assert.match(dom.innerHTML,/Submit booking request/);
ctx.testEvent={preventDefault(){},target:{__fields:{type:'Kiddies Party',date:'2026-12-15',start:'10:00',end:'12:00',location:'Johannesburg Venue',guests:'20',notes:'demo',name:'Demo Customer',phone:'0821234567',email:'demo@example.com'}}};
run('submitBooking(testEvent)');assert.match(dom.innerHTML,/Booking request/);assert.equal(run('bookings[0].status'),'pending');
run('navigate("admin")');assert.match(dom.innerHTML,/Total bookings/);
run('adminTab="bookings";render()');assert.match(dom.innerHTML,/Approve/);
run('statusChange(0,"confirmed")');assert.equal(run('bookings[0].status'),'confirmed');
run('navigate("track")');ctx.lookupEvent={preventDefault(){},target:{__fields:{ref:run('bookings[0].reference'),email:'demo@example.com'}}};
run('findBooking(lookupEvent)');assert.match(dom.innerHTML,/confirmed/);
console.log('PASS: homepage, catalogue, popcorn, candy floss, cart, submission, approval and customer tracking');
