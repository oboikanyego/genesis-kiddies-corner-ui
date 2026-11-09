import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { BookingApiService } from '../core/booking-api.service';
import { OccasionItem, OccasionInput, OccasionTheme } from '../core/models';
import { OCCASION_BACKGROUNDS } from '../core/site-config';
import { prepareServicePhoto } from '../core/photo-upload';

const blankOccasion=():OccasionInput=>({
  name:'',label:'',emoji:'🎉',theme:'pink',photo:'',active:true,sortOrder:100
});

@Component({
  selector:'app-occasion-manager',
  standalone:true,
  imports:[FormsModule],
  template:`
<section class="occasion-admin">
  <div class="occasion-admin-heading">
    <div><h2>Occasions we cater for</h2><p>Add, edit or hide the occasions shown on the homepage and in the booking form. Changes are saved to MongoDB.</p></div>
    <button class="btn btn-pink" type="button" (click)="adding.set(!adding())">{{adding()?'Cancel':'+ Add occasion'}}</button>
  </div>
  @if(error()){<div class="notice error" role="alert">{{error()}}</div>}
  @if(message()){<div class="notice success" role="status">{{message()}}</div>}
  @if(adding()){
    <form class="panel occasion-admin-create" (ngSubmit)="create()" #newForm="ngForm">
      <h3>New occasion</h3>
      <div class="occasion-admin-fields">
        <label>Title on homepage<input name="label" type="text" [(ngModel)]="draft.label" maxlength="80" minlength="2" placeholder="e.g. Sports Days" required/></label>
        <label>Option in booking form<input name="name" type="text" [(ngModel)]="draft.name" maxlength="80" minlength="2" placeholder="e.g. Sports Day" required/></label>
        <label>Icon / emoji<input name="emoji" type="text" [(ngModel)]="draft.emoji" maxlength="16" required/></label>
        <label>Colour theme<select name="theme" [(ngModel)]="draft.theme">@for(theme of themes;track theme){<option [value]="theme">{{theme}}</option>}</select></label>
        <label>Display order<input name="sortOrder" type="number" [(ngModel)]="draft.sortOrder" min="0" max="9999" required/></label>
      </div>
      <p class="occasion-admin-help">After creating, you can upload a real photograph. Customers can select its booking type immediately.</p>
      <button class="btn btn-pink" type="submit" [disabled]="!!busyId()||newForm.invalid">Create occasion</button>
    </form>
  }
  @if(loading()){<p class="occasion-admin-help">Loading occasions…</p>}
  @for(item of occasions();track item._id){
    <article class="panel occasion-admin-card">
      <div class="occasion-admin-image">
        <div class="occasion-admin-preview" [style.background]="background(item.theme)">
          @if(preview(item)){<img [src]="preview(item)" [alt]="item.label"/>}
          @else{<span aria-hidden="true">{{item.emoji}}</span>}
        </div>
        <label class="service-photo-pick">
          <span>Change picture</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" (change)="choosePhoto($event,item)" [attr.aria-label]="'Change picture for '+item.label"/>
        </label>
        @if(pendingPhotos()[item._id]){
          <small class="service-photo-pending">New picture selected. Save to publish.</small>
          <button type="button" class="service-photo-cancel" (click)="clearPhoto(item._id)">Cancel picture</button>
        }
      </div>
      <div class="occasion-admin-main">
        <div class="occasion-admin-fields">
          <label>Title on homepage<input type="text" [(ngModel)]="item.label" maxlength="80" [attr.aria-label]="'Homepage title for '+item.name"/></label>
          <label>Option in booking form<input type="text" [(ngModel)]="item.name" maxlength="80" [attr.aria-label]="'Booking event type for '+item.label"/></label>
          <label>Icon / emoji<input type="text" [(ngModel)]="item.emoji" maxlength="16" [attr.aria-label]="'Emoji for '+item.label"/></label>
          <label>Colour theme<select [(ngModel)]="item.theme" [attr.aria-label]="'Colour for '+item.label">@for(theme of themes;track theme){<option [value]="theme">{{theme}}</option>}</select></label>
          <label>Display order<input type="number" min="0" max="9999" [(ngModel)]="item.sortOrder" [attr.aria-label]="'Order for '+item.label"/></label>
        </div>
        <div class="occasion-admin-actions">
          <label class="toggle-label"><input type="checkbox" [(ngModel)]="item.active"/> Show on homepage and booking form</label>
          <button class="btn btn-pink" type="button" (click)="save(item)" [disabled]="!!busyId()">{{busyId()===item._id?'Saving…':'Save changes →'}}</button>
        </div>
      </div>
    </article>
  }
  @if(!loading()&&!occasions().length){<p>No occasions have been added yet.</p>}
  <p class="occasion-admin-help">Hiding an occasion removes it from new bookings but keeps all existing bookings. Images are compressed to save storage.</p>
</section>
`
})
export class OccasionManagerComponent {
  private api=inject(BookingApiService);
  occasions=signal<OccasionItem[]>([]);
  loading=signal(true);
  adding=signal(false);
  busyId=signal('');
  error=signal('');
  message=signal('');
  draft=blankOccasion();
  themes:OccasionTheme[]=['pink','blue','purple','orange','mint','yellow'];
  pendingPhotos=signal<Record<string,Blob>>({});
  previews=signal<Record<string,string>>({});
  constructor(){this.reload();}
  background(theme:OccasionTheme){return OCCASION_BACKGROUNDS[theme]||OCCASION_BACKGROUNDS.pink;}
  preview(item:OccasionItem){return this.previews()[item._id]||item.photo;}
  reload(){
    this.loading.set(true);
    this.api.adminOccasions().subscribe({
      next:items=>{this.occasions.set(items);this.loading.set(false);},
      error:e=>{this.loading.set(false);this.report(e);}
    });
  }
  report(e:any){this.error.set(e?.error?.message||'Could not save. Check your connection and try again.');}
  clearPhoto(id:string){
    const previous=this.previews()[id];
    if(previous)URL.revokeObjectURL(previous);
    this.previews.update(s=>{const n={...s};delete n[id];return n;});
    this.pendingPhotos.update(s=>{const n={...s};delete n[id];return n;});
  }
  async choosePhoto(event:Event,item:OccasionItem){
    const picker=event.target as HTMLInputElement;
    const file=picker.files?.item(0);
    picker.value='';
    if(!file)return;
    this.error.set('');
    try{
      const blob=await prepareServicePhoto(file);
      const url=URL.createObjectURL(blob);
      this.clearPhoto(item._id);
      this.pendingPhotos.update(s=>({...s,[item._id]:blob}));
      this.previews.update(s=>({...s,[item._id]:url}));
    }catch(e){this.error.set(e instanceof Error?e.message:'Unable to read the image.');}
  }
  create(){
    if(this.busyId())return;
    this.busyId.set('create');this.error.set('');this.message.set('');
    const newData={...this.draft,sortOrder:Number(this.draft.sortOrder)};
    this.api.adminCreateOccasion(newData).subscribe({
      next:item=>{
        this.busyId.set('');this.adding.set(false);this.draft=blankOccasion();
        this.occasions.update(s=>[...s,item].sort((a,b)=>a.sortOrder-b.sortOrder));
        this.message.set(item.label+' created. You can now add a picture.');
      },error:e=>{this.busyId.set('');this.report(e);}
    });
  }
  save(item:OccasionItem){
    if(this.busyId())return;
    this.busyId.set(item._id);this.error.set('');this.message.set('');
    const data={...item,sortOrder:Number(item.sortOrder)};
    const photo=this.pendingPhotos()[item._id];
    const request=photo
      ? this.api.adminUploadOccasionPhoto(item._id,photo).pipe(switchMap(({photo})=>this.api.adminSaveOccasion({...data,photo})))
      : this.api.adminSaveOccasion(data);
    request.subscribe({
      next:updated=>{
        this.busyId.set('');this.clearPhoto(item._id);
        this.occasions.update(items=>items.map(o=>o._id===updated._id?updated:o).sort((a,b)=>a.sortOrder-b.sortOrder));
        this.message.set(updated.label+' saved successfully.');
      },
      error:e=>{this.busyId.set('');this.report(e);}
    });
  }
}
