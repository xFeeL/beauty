import { Component, ChangeDetectionStrategy, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { StyleRenderer, WithStyles, lyl, ThemeRef, ThemeVariables } from '@alyle/ui';
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog';
import { LySliderChange, STYLES as SLIDER_STYLES } from '@alyle/ui/slider';
import {
  STYLES as CROPPER_STYLES,
  LyImageCropper,
  ImgCropperConfig,
  ImgCropperEvent,
  ImgCropperErrorEvent
} from '@alyle/ui/image-cropper';

const STYLES = (_theme: ThemeVariables, ref: ThemeRef) => {
  ref.renderStyleSheet(SLIDER_STYLES);
  ref.renderStyleSheet(CROPPER_STYLES);
  const slider = ref.selectorsOf(SLIDER_STYLES);
  const cropper = ref.selectorsOf(CROPPER_STYLES);

  return {
    root: lyl `{
      ${cropper.root} {
        max-width: 700px
        height: 320px
      }
    }`,
    sliderContainer: lyl `{
      position: relative
      ${slider.root} {
        width: 80%
        position: absolute
        left: 0
        right: 0
        margin: auto
        top: -32px
      }
    }`,
    cropResult: lyl `{
        border-radius: 50%
      }`,
    slider: lyl `{
      padding: 1em
    }`
  };
};
@Component({
    templateUrl: './cropper-dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
      StyleRenderer
    ]
  })
  export class CropperDialog implements WithStyles, AfterViewInit {
  
   
  readonly classes = this.sRenderer.renderSheet(STYLES, 'root');
  ready!: boolean;
  scale!: number;
  minScale!: number;
  @ViewChild(LyImageCropper, { static: true }) cropper!: LyImageCropper;
  myConfig: ImgCropperConfig = {
    width: 150,
    height: 150,
    round: true,
    
    // type: 'image/png',
    
    keepAspectRatio: true,
    responsiveArea: true,
    output: {
      width: 200,
      height: 200
    },
    resizableArea: true
  };

  // Inside CropperDialog component:

constructor(
  @Inject(LY_DIALOG_DATA) public data: any, // data contains the imageURL and other settings
  readonly sRenderer: StyleRenderer,
  public dialogRef: LyDialogRef
) {
  this.data = data; 
 
  // Initialize the configuration with dynamic values
  this.myConfig = {
    width: data.width, // Passed width from the dialog opener
    height: data.height, // Passed height from the dialog opener
    round: data.round, // Passed round from the dialog opener
    keepAspectRatio: true,
    responsiveArea: true,
    output: {
      width: data.width,
      height: data.height
    },
    resizableArea: true
    // ... any other configuration properties
  };
}

  ngAfterViewInit() {
    // Load image when dialog animation has finished
    this.dialogRef.afterOpened.subscribe(() => {
      this.cropper.loadImage(this.data.imageURL); // Use the imageUrl from this.data
        });
  }

  onCropped(e: ImgCropperEvent) {
  }
  onLoaded(e: ImgCropperEvent) {
  }
  onError(e: ImgCropperErrorEvent) {
    // Close the dialog if it fails
    this.dialogRef.close();
  }

  onSliderInput(event: LySliderChange) {
    this.scale = event.value as number;
  }

}