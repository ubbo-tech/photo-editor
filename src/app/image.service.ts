import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  pngToJpg(base64:string){

  }

  convertFormat(base64:string,requestFormat:string){
    return new Promise<string>((resolve, reject) => {
      console.log("gelen format",requestFormat)
      var img = new Image();
      img.src=base64;
      img.addEventListener('load', function () {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        var pngDataUrl = canvas.toDataURL(requestFormat);
        resolve(pngDataUrl);
      })})
  }
}
