import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {FastaPage} from './fasta';

@NgModule({
    declarations: [
        FastaPage,
    ],
    imports: [
        IonicPageModule.forChild(FastaPage),
    ],
})
export class FastaPageModule {
}
