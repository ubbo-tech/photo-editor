import { Component, ElementRef, ViewChild } from '@angular/core';
import { formModel } from 'src/app/interfaces/form-interface';
import { ImageService } from 'src/app/image.service';
import { tick } from '@angular/core/testing';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // global variables
  @ViewChild('imgInput', { static: true }) imgInput!: ElementRef;
  @ViewChild('uploadImg', { static: false }) uploadImg!: ElementRef;
  constructor(private imageService: ImageService) { }
  selectedImage: any = null;
  placeholderImg: string | ArrayBuffer | null = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0wCMeZEmEVvleEOtCQzV2oMV5gfgnej2mrTHBIahe8zdQf9nz47SgVyhyQOKuGAPE6eY&usqp=CAU";
  formObject: formModel = {
    cozunurluk: 99,
    fileType: null,
    compres: 0,
    cerceve: "varsayılan",
    en: null,
    boy: null,
    specialRatHeight: 1,
    specialRatWitdh: 1,
    specialResHeight: 400,
    specialResWidth: 360
  };
  receivedImg: any = {
    size: "",
    type: "",
    height: "",
    width: ""
  }
  receivedImgElement: any;
  isDisabled: boolean = true;
  resolution: string = "";
  resolutionSize: any = {
    1: { //360
      width: 480,
      height: 360
    },
    2: { //720px
      width: 1280,
      height: 720
    },
    3: {  //1080
      width: 1920,
      height: 1080
    },
    4: { //1440
      width: 2560,
      height: 1440
    },
    5: { //2160
      width: 3840,
      height: 2160
    },
  }
  loadIsVisible: boolean = false;
  newImg: any;
  ngOnInit() {
    // alert('Uyarı Verilerinizi kontrol ediniz',)

  }
  //methods
  // img'ye tıklanırsa input teteiklenir
  uploadPohoto() {
    this.imgInput.nativeElement.click();
  };

  onFileSelected(event: any) {
    this.loadIsVisible = true
    let self = this;
    const file: File = event.target.files[0];
    //uzantı alınır
    var typeParts = file.type.split('/');
    this.receivedImg.type = file.type.split('/')
    this.formObject.fileType = typeParts[1];
    // Eğer jpg ise jpeg kabul edilebilir
    if (this.formObject.fileType == "jpg") {
      this.formObject.fileType = "jpeg";
    };
    const reader = new FileReader();
    const img: any = new Image();
    //dosya okunur
    reader.onload = () => {
      this.selectedImage = reader.result;
      this.placeholderImg = this.selectedImage
      this.isDisabled = false;
      img.src = reader.result;
      // mevcuttaki çözünürlük alınır
      img.addEventListener('load', function () {
        self.resolution = img.width + "x" + img.height
      }, false);
      setTimeout(() => {
        this.receivedImg.size = (file.size) / 1024 //kb to mb
        this.receivedImg.width = img.width;
        this.receivedImg.height = img.height;
        this.newImg = img
        console.log("recevid img,", this.receivedImg.width, "-", this.receivedImg.height)
        this.loadIsVisible = false
      }, 800);

    };
    reader.readAsDataURL(file); // Dosyayı base64'e dönüştür
  };
  async submitForm() {
    this.loadIsVisible = true;
    const valid: boolean = await this.formValid()
    if (!valid) {
      alert('Uyarı')
      this.loadIsVisible = false;
      return;
    }
    console.log("devam")
    // İlk okunan base64 değeri base64Img değişkenine atanır
    let base64Img = this.selectedImage;
    // Crop İşlemi
    if (this.formObject.cerceve !== "varsayılan") {
      base64Img = await this.cropImg()
      console.log("crop imageden dönen foto", base64Img)
    }
    // RESİZE
    if (this.formObject.cozunurluk !== 99) {
      base64Img = await this.resizeImg(base64Img);
      console.log("resize foto", base64Img)
    };
    if (this.formObject.compres !== 0) {
      base64Img = await this.compressImg(base64Img);
    };
    if (this.receivedImg.type !== this.formObject.fileType) {
      if (this.formObject.fileType == "png") {
        console.log("png")
        base64Img = await this.imageService.convertFormat(base64Img, 'image/png')
      }
      else if (this.formObject.fileType == "jpg" || this.formObject.fileType == "jpeg") {
        console.log("jpg/jpeg")
        base64Img = await this.imageService.convertFormat(base64Img, 'image/jpg')
      }

    }
    setTimeout(() => {
      console.log("teeeeeeest")
      var a = document.createElement('a');
      a.href = base64Img;
      a.download = 'cropyai.' + this.formObject.fileType; // İndirilen dosyanın adı
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.loadIsVisible = false
    }, 2000);

  };

  formValid() {
    return new Promise<boolean>((resolve, reject) => {
      console.log(this.formObject)
      resolve(true);
    })
  }

  cropImg() {
    return new Promise<string>((resolve, reject) => {
      console.log("*****")
      //orj img
      const sourceWidth = this.receivedImg.width; // Orijinal resmin genişliği
      const sourceHeight = this.receivedImg.height; // Orijinal resmin yüksekliği
      const inputImageAspectRatio = sourceWidth / sourceHeight; // Orijinal resmin en boy oranı
      console.log(" Orijinal resmin en boy oranı", sourceWidth, " / ", sourceHeight)
      let widthRatio: any;
      let heightRatio: any;
      if (this.formObject.cerceve === '0') {
        widthRatio = this.formObject.specialRatWitdh
        heightRatio = this.formObject.specialRatHeight
        console.log(widthRatio)
        if (widthRatio < 1 || heightRatio < 1) {
          alert('En Boy Oranı alanları için pozitif tam sayılar geeçerlidir');
          this.loadIsVisible = false
          return;
        }
      }
      if (this.formObject.cerceve !== '0') {
        var size: any = this.formObject.cerceve?.split('/');
        widthRatio = parseInt(size[0], 10);
        heightRatio = parseInt(size[1], 10);
      }
      console.log("Crop: ", widthRatio, " / ", heightRatio);
      const outputImageAspectRatio = widthRatio / heightRatio;

      // başlangıçtat eşit kabul edelim
      let outputWidth = sourceWidth;
      let outputHeight = sourceHeight;
      // get the aspect ratio of the input image

      if (inputImageAspectRatio > outputImageAspectRatio) {
        outputWidth = sourceHeight * outputImageAspectRatio;
      } else if (inputImageAspectRatio < outputImageAspectRatio) {
        outputHeight = sourceWidth / outputImageAspectRatio;
      }
      console.log("son haldeki çözünürlük", outputWidth, " / ", outputHeight)
      console.log("son oran",)

      // create a canvas that will present the output image
      const outputImage = document.createElement('canvas');
      // set it to the same size as the image
      outputImage.width = outputWidth;
      outputImage.height = outputHeight;
      console.log("nihai somuç karesi", outputImage.width, outputImage.height);
      // Orjinal resmin orta noktası
      var originalCenterX = sourceWidth / 2;
      var originalCenterY = sourceHeight / 2;

      // Yeni kırpılmış resmin köşe noktalarının hesaplanması
      var newCornerX = originalCenterX - (outputImage.width / 2);
      console.log(originalCenterX, "-", (outputImage.width / 2), " = ", newCornerX)
      var newCornerY = originalCenterY - (outputImage.height / 2);
      console.log(originalCenterY, "-", (outputImage.height / 2), " = ", newCornerY)
      console.log("Yeni kırpılmış resmin köşe noktalarının hesaplanması", newCornerX, newCornerY);


      ///// download new img
      var canvas = document.createElement('canvas');
      canvas.height = outputImage.height;
      canvas.width = outputImage.width;
      var ctx = canvas.getContext('2d');
      console.log("NEW CORNER", newCornerX, " Newc Y", newCornerY)

      ctx?.drawImage(this.newImg, newCornerX, newCornerY, outputImage.width, outputImage.height, 0, 0, outputImage.width, outputImage.height);
      var croppedImage = canvas.toDataURL('image/jpeg'); // Resmi veri URL'sine dönüştür
      setTimeout(() => {
        console.log("son base64", croppedImage)
        // İndirme bağlantısını oluştur
        // var downloadLink = document.createElement('a');
        // document.body.appendChild(downloadLink);
        // downloadLink.href = croppedImage;
        // this.placeholderImg = croppedImage
        this.receivedImg.width=outputImage.width // Orijinal resmin genişliği
        this.receivedImg.height=outputImage.height;; // Orijinal resmin yüksekliği
        resolve(croppedImage)
        // downloadLink.download = 'kırpılmış_resim.jpg'; // İndirilecek dosya adı
        // downloadLink.click();
        // document.body.removeChild(downloadLink);

      }, 1000);
    })
  };

  resizeImg(base64: string) {
    return new Promise<string>((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      let self = this;
      const img = new Image()
      img.src = base64;
      if (this.formObject.cozunurluk != 6) {
        let val = Number(this.formObject.cozunurluk);
        let outputImageAspectRatio = self.resolutionSize[val].width / self.resolutionSize[val].height
        const sourceWidth = this.receivedImg.width; // Orijinal resmin genişliği 
        const sourceHeight = this.receivedImg.height; // Orijinal resmin yüksekliği 
        const inputImageAspectRatio = sourceWidth / sourceHeight; // Orijinal resmin en boy oranı 
        console.log("orjinal en boy",inputImageAspectRatio)
        // başlangıçtat eşit kabul edelim
        let outputWidth = sourceWidth;
        let outputHeight = sourceHeight;
        let startX = 0;
        let startY = 0;

        if (inputImageAspectRatio > outputImageAspectRatio) {
          // Yatay eksende fazlalık var, yani resmin yüksekliğini ayarla
          outputWidth = sourceHeight * outputImageAspectRatio;
          startX = (sourceWidth - outputWidth) / 2;
        } else {
          // Dikey eksende fazlalık var, yani resmin genişliğini ayarla
          outputHeight = sourceWidth / outputImageAspectRatio; // Doğru şekilde ayarlandı
          startY = (sourceHeight - outputHeight) / 2; // startY kısmı düzeltildi
        }

        canvas.width =  self.resolutionSize[val].width
        canvas.height =  self.resolutionSize[val].height
        console.log("çizilecek çöz",self.formObject.specialResWidth, "x", self.formObject.specialResHeight)
        img.addEventListener('load', function () {
          ctx?.drawImage(img,
            startX, startY, outputWidth, outputHeight,
            0, 0, self.resolutionSize[val].width ,  self.resolutionSize[val].height
          );
          // create a new base64 encoding
          var resampledImage = new Image();
          resampledImage.height=self.formObject.specialResHeight
          console.log("buralar çalıştı")
          resampledImage.width=self.formObject.specialResWidth 
          resampledImage.src = canvas.toDataURL();
          resolve(resampledImage.src);
        }, false);
        return;
      }
      else if (this.formObject.cozunurluk == 6) {
        if (self.formObject.specialResWidth < 1 || self.formObject.specialResHeight < 1) {
          alert('Görüntü çözünürlüğü negatif olamaz')
          this.loadIsVisible = false;
          return
        }
        const sourceWidth = this.receivedImg.width; // Orijinal resmin genişliği
        const sourceHeight = this.receivedImg.height; // Orijinal resmin yüksekliği
        const inputImageAspectRatio = sourceWidth / sourceHeight; // Orijinal resmin en boy oranı

        const outputImageAspectRatio=self.formObject.specialResWidth /self.formObject.specialResHeight 
        let outputWidth = sourceWidth;
        let outputHeight = sourceHeight;
        let startX = 0;
        let startY = 0;

        if (inputImageAspectRatio > outputImageAspectRatio) {
          // Yatay eksende fazlalık var, yani resmin yüksekliğini ayarla
          outputWidth = sourceHeight * outputImageAspectRatio;
          startX = (sourceWidth - outputWidth) / 2;
        } else {
          // Dikey eksende fazlalık var, yani resmin genişliğini ayarla
          outputHeight = sourceWidth / outputImageAspectRatio; // Doğru şekilde ayarlandı
          startY = (sourceHeight - outputHeight) / 2; // startY kısmı düzeltildi
        }
        
        canvas.width = self.formObject.specialResWidth
        canvas.height = self.formObject.specialResHeight ;
        console.log("çizilecek çöz",self.formObject.specialResWidth, "x", self.formObject.specialResHeight)
        img.addEventListener('load', function () {
          ctx?.drawImage(img,
            startX, startY, outputWidth, outputHeight,
            0, 0, self.formObject.specialResWidth , self.formObject.specialResHeight 
          );
          // create a new base64 encoding
          var resampledImage = new Image();
          resampledImage.height=self.formObject.specialResHeight
          console.log("buralar çalıştı")
          resampledImage.width=self.formObject.specialResWidth 
          resampledImage.src = canvas.toDataURL();
          resolve(resampledImage.src);
        }, false);
        return;
      }

      // console.log(canvas.width, canvas.height)
      // img.addEventListener('load', function () {
      //   ctx?.drawImage(img,
      //     0, 0, img.width, img.height,
      //     0, 0, canvas.width, canvas.height
      //   );
        
      //   // create a new base64 encoding
      //   var resampledImage = new Image();
      //   resampledImage.src = canvas.toDataURL();
      //   resolve(resampledImage.src);
      //   // console.log(resampledImage.src);
      //   // var a = document.createElement('a');
      //   // a.href = resampledImage.src;
      //   // a.download = 'resize.png'; // İndirilen dosyanın adı
      //   // document.body.appendChild(a);
      //   // a.click();
      //   // document.body.removeChild(a);

      // }, false);
      // ctx?.drawImage(img, 0, 0, self.resolutionSize[val].width, self.resolutionSize[val].height);

    })

  };

  compressImg(base64: string) {
    let self = this
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.addEventListener('load', function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Resmi canvas üzerine çiz
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        // Sıkıştırma oranı ayarlanabilir
        if (self.formObject.compres) {
          const quality: any = 1 - (self.formObject.compres / 100);
          console.log(quality)
          const compressedBase64: any = canvas.toDataURL('image/jpeg', quality);
          console.log("sıkıştırılmış", compressedBase64)
          resolve(compressedBase64)
        }
      }, false);

    })


  };
}

