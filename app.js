const form=document.querySelector('#enquiry-form');
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.08});
 document.querySelectorAll('.steps article,.role-grid article,.story,.price-card,.contact-next li').forEach(el=>{el.classList.add('reveal-ready');observer.observe(el)});
}
if(form){const started=Date.now();const key=crypto.randomUUID();form.addEventListener('submit',async e=>{
 e.preventDefault();if(form._showInvalidStep)form._showInvalidStep();if(!form.reportValidity())return;
 const status=document.querySelector('#form-status'),button=form.querySelector('button[type=submit]');button.disabled=true;button.textContent='Sending…';status.className='';status.textContent='Saving your enquiry securely…';
 try{const fields=new FormData(form),values=Object.fromEntries(fields);const interests=fields.getAll('interest');delete values.interest;
 if(values.package){values.message='Setup: '+values.package+'\n\n'+values.message;delete values.package;}
 if(interests.length)values.message='Interested in: '+interests.join(', ')+'.\n\n'+values.message;
 values.requestKey=key;values.elapsed=Math.floor((Date.now()-started)/1000);
 const response=await fetch('https://furqaninstitute.co.uk/madrasadesk/enquiry.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
 const result=await response.json();if(!response.ok)throw new Error(result.message||'We could not save your enquiry. Please try again.');
 const success=document.createElement('div');success.className='form-success';success.tabIndex=-1;success.setAttribute('role','status');
 const icon=document.createElement('span');icon.className='success-icon';icon.textContent='✓';icon.setAttribute('aria-hidden','true');
 const title=document.createElement('h3');title.textContent='JazakAllah khair.';
 const body=document.createElement('p');body.textContent='We’ve received your enquiry and will contact you to arrange a personal walkthrough.';
 const ref=document.createElement('p');ref.className='receipt';ref.textContent='Your reference: '+result.reference;
 success.append(icon,title,body,ref);form.replaceChildren(success);success.focus();
 }catch(err){status.className='error';status.textContent=err.message==='Failed to fetch'?'We couldn’t connect. Your answers are still here. Please try again, or email hello@madrasadesk.co.uk.':err.message;button.disabled=false;button.textContent='Request a demo ↗';status.focus();}
})}

document.querySelectorAll('[data-plan]').forEach(link=>link.addEventListener('click',()=>{const choice=document.querySelector('select[name=package]');if(choice)choice.value=link.dataset.plan;}));

// Motion enhances the page; content remains available without it.
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
if(!reduceMotion.matches && 'IntersectionObserver' in window){
 const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');reveal.unobserve(e.target)}}),{threshold:.12});
 document.querySelectorAll('[data-reveal]').forEach(el=>{el.classList.add('reveal-ready');reveal.observe(el)});
 const stage=document.querySelector('[data-depth]');
 if(stage){let queued=false;const update=()=>{const y=stage.getBoundingClientRect().top;stage.style.setProperty('--tilt',Math.max(0,Math.min(7,y/100))+'deg');queued=false};addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});update()}
}
document.querySelectorAll('[data-colour]').forEach(button=>button.addEventListener('click',()=>{const colors={blue:'#416aa0',green:'#34735f',purple:'#765aa3'};const card=document.querySelector('.identity-card');card.style.setProperty('--accent',colors[button.dataset.colour]);card.dataset.theme=button.dataset.colour;document.querySelectorAll('[data-colour]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))})}));

// Progressive enquiry: the same fields and endpoint, with answers retained between steps.
if(form){
 const steps=[...form.querySelectorAll('.enquiry-step')],back=form.querySelector('#enquiry-back'),next=form.querySelector('#enquiry-next'),submit=form.querySelector('[type=submit]');let step=0;
 const labels=['You','Your teaching','Your priorities','Contact'];
 function validCurrent(){return [...steps[step].querySelectorAll('input,textarea,select')].every(el=>el.reportValidity())}
 function showStep(focus=true){steps.forEach((el,i)=>el.hidden=i!==step);back.disabled=step===0;next.hidden=step===3;submit.hidden=step!==3;form.querySelector('#enquiry-step-label').textContent=(step+1)+' of 4 · '+labels[step];const track=form.querySelector('.enquiry-track');track.setAttribute('aria-valuenow',step+1);track.firstElementChild.style.width=((step+1)*25)+'%';if(step===3){const v=new FormData(form);form.querySelector('#enquiry-review').textContent=[v.get('name'),v.get('organisation'),v.get('size')+' students',v.get('package')].join(' · ')}if(focus){steps[step].querySelector('h4').focus({preventScroll:true});if(form.getBoundingClientRect().top<90)form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}}
 form._showInvalidStep=()=>{const invalid=steps.findIndex(el=>[...el.querySelectorAll('input,textarea,select')].some(f=>!f.checkValidity()));if(invalid>=0){step=invalid;showStep()}};
 back.onclick=()=>{if(step>0){step--;showStep()}};next.onclick=()=>{if(validCurrent()){step++;showStep()}};
 form.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&step<3){e.preventDefault();next.click()}});
 form.noValidate=true;form.classList.add('enquiry-enhanced');form.querySelector('.enquiry-progress').hidden=false;form.querySelector('.enquiry-controls').hidden=false;showStep(false);
 const plan=new URLSearchParams(location.search).get('plan');if(['Teacher','Madrasa','Tailored'].includes(plan))form.querySelector('[name=package]').value=plan;
}
