import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import {Language} from 'angular-l10n';
import {TdLoadingService} from '@covalent/core';
import * as _ from 'lodash';
import { Uom } from '../../uom/uom';
import { UomService } from '../../uom/uom.service';
import { UploadService } from '../../../services/upload.service';

@Component({
  selector: 'app-main-setting-uom--dialog',
  templateUrl: './uom-dialog.component.html',
  styleUrls: ['./uom-dialog.component.scss'],
  providers: [UomService]
})
export class UomDialogComponent implements OnInit {
  data: Uom = new Uom({});
  error: any;
  images = [];
  storage_ref = '/main/settings/uom';

  constructor(@Inject(MAT_DIALOG_DATA) public md_data: Uom,
              private _uomService: UomService,
              private _loadingService: TdLoadingService,
              public dialogRef: MatDialogRef<UomDialogComponent>) {

    try {
      if (md_data) {
        this.data = new Uom(md_data);
      } else {
        this._uomService.requestData().subscribe(() => {
          this.generateCode();
        });
      }
    } catch (error) {
      this.error = error;
    }
  }

  ngOnInit(): void {
  }

  generateCode() {
    this._loadingService.register('data.form');
    const prefix = 'UOM';
    this.data.code = prefix + '-001';
    console.log('Prev Code :' + this.data.code);
    this._uomService.requestLastData().subscribe((s) => {
      s.forEach((ss: Uom) => {
        // tslint:disable-next-line:radix
        const str = parseInt(ss.code.substring(ss.code.length - 3, ss.code.length)) + 1;
        let last = prefix + '-' + str;

        if (str < 100) {
          last = prefix + '-0' + str;
        }

        if (str < 10) {
          last = prefix + '-00' + str;
        }

        this.data.code = last;
      });
      this._loadingService.resolve('data.form');
    });
  }

  saveData(form) {

    if (form.valid) {

      this.error = false;
      this._loadingService.register();

      this.data.name1 = form.value.name1 ? form.value.name1 : null;

      if (this.md_data) {
        if (_.isEqual(this.data, this.md_data)) {
          this.dialogRef.close(false);
        } else {
          this._uomService.updateData(this.data).then(() => {
            this.dialogRef.close(this.data);
            this._loadingService.resolve();
          }).catch((err) => {
            this.error = err.message;
            this._loadingService.resolve();
          });
        }
      } else {
        this._uomService.addData(this.data).then(() => {
          this.dialogRef.close(this.data);
          this._loadingService.resolve();
        }).catch((err) => {
          this.error = err.message;
          this._loadingService.resolve();
        });
      }
    }
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }
}
