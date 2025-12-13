import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetComponent } from './widget.component';
import { IonicModule } from '@ionic/angular';
import { WidgetRoutingModule } from './widget-routing.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [WidgetComponent],
  imports: [
    CommonModule,
    IonicModule,
    WidgetRoutingModule,
    TranslateModule
  ]
})
export class WidgetModule { }
