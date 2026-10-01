/** Original geometry with a scoped room controller. No server request is made. */
export default function initialize(context) {
  const {document,window,addEventListener}=context;
  const scene=document.querySelector('#scene'), vp=document.querySelector('#vp'), modal=document.querySelector('.modal');
  const fit=()=>{const s=Math.min(1,context.width/1280,context.height/1067);scene.style.setProperty('--s',s);vp.style.width=1280*s+'px';vp.style.height=1067*s+'px';};
  addEventListener('resize',fit);fit();
  const wave=document.querySelector('#waves');
  const paths=Array.from({length:24},(_,j)=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('fill','none');p.setAttribute('stroke','#ff315b');p.setAttribute('stroke-width',j%7===0?'1.1':'.65');p.setAttribute('opacity','.35');wave.append(p);return p;});
  context.motion.add(wave,t=>paths.forEach((path,j)=>{let d='';for(let i=0;i<=50;i++){const x=i*11,y=85+j*3+Math.sin(i*.22+t+j*.08)*20+Math.sin(i*.09-t*.7)*12;d+=(i?'L':'M')+x+' '+y;}path.setAttribute('d',d);}));
  const name=document.querySelector('#name'), code=document.querySelector('#code'), tabs=[...document.querySelectorAll('.tab')], primary=document.querySelector('.join');
  let mode='join';
  document.querySelector('.clear').onclick=()=>{name.value='';name.classList.remove('filled');name.focus();};
  document.querySelectorAll('.input').forEach(input=>input.addEventListener('input',()=>input.classList.toggle('filled',!!input.value)));
  tabs.forEach((button,i)=>button.onclick=()=>{mode=i?'create':'join';tabs.forEach(t=>t.classList.toggle('active',t===button));code.disabled=mode==='create';code.placeholder=i?'Код будет создан приложением':'Введите код комнаты';primary.querySelector('span').textContent=i?'Создать комнату':'Войти в комнату';});
  primary.onclick=()=>{if(!name.value.trim()){name.focus();return;}if(mode==='join'&&!code.value.trim()){code.focus();return;}context.notify?.('Данные формы готовы. Сетевое подключение не выполняется.');window.dispatchEvent(new CustomEvent('room:submit',{detail:{mode,name:name.value,code:code.value}}));};
  let reopen=null;
  const close=()=>{modal.hidden=true;reopen=document.createElement('button');reopen.className='ad ad-button';reopen.dataset.adMaterial='ruby';reopen.textContent='Открыть подключение';reopen.onclick=()=>{modal.hidden=false;reopen.remove();};document.body.append(reopen);};
  document.querySelector('.close').onclick=close;document.querySelector('.actions>.btn').onclick=close;document.querySelector('.bottom').onclick=()=>tabs[1].click();
  context.api.RoomConnectionView={getValue:()=>({mode,name:name.value,code:code.value}),setMotion:v=>context.motion.set(v),destroy:()=>{paths.forEach(p=>p.remove());reopen?.remove();}};
}
