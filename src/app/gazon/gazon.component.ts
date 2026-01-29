import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-gazon',
  templateUrl: './gazon.component.html',
  styleUrls: ['./gazon.component.scss']
})
export class GazonComponent implements OnInit {
  selectedFile: File | null = null;
  sourceFormat: string = '';
  targetFormat: string = '';
  fileSize: string = '';
  conversionResult: { success: boolean; message: string } | null = null;
  downloadUrl: string = '';
  isLoading: boolean = false;
  isDragOver: boolean = false;
  autoDownloadEnabled: boolean = true; // по умолчанию включено
  showDownloadButton: boolean = false; // показывать ли кнопку скачивания
  isFirstConversion: boolean = true; // это первая конвертация?

  // ключи для хранения настроек
  private readonly TARGET_FORMAT_KEY = 'gazon_converter_target_format';
  private readonly AUTO_DOWNLOAD_KEY = 'gazon_auto_download_enabled';
  private readonly IS_FIRST_CONVERSION_KEY = 'gazon_is_first_conversion';

  // таймер для отложенной автоматической конвертации
  private autoConvertTimer: any = null;

  // поддерживаемые форматы для конвертации
  readonly supportedFormats = [
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 
    'ico', 'tiff', 'svg', 'avif', 'heic', 'pdf', 
    'doc', 'docx', 'txt', 'rtf'
  ];

    constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    console.log('компонент инициализирован');
    this.loadAllSettings();
  }

  // обработчик выбора файла
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.processFile(target.files[0]);
    }
  }

  // обработчик drag and drop
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  // обработчик перетаскивания над областью
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  // обработчик выхода из области перетаскивания
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  // обработка выбранного файла
  private processFile(file: File): void {
    this.selectedFile = file;
    this.calculateFileSize(file.size);
    this.detectSourceFormat(file);
    this.conversionResult = null;
    this.downloadUrl = '';
    this.showDownloadButton = false;
    
    // загружаем сохраненные настройки
    this.loadAllSettings();
    
    // если автоскачивание включено и выбран целевой формат - запускаем автоматическую конвертацию
    if (this.autoDownloadEnabled && this.targetFormat && this.targetFormat.trim() !== '') {
      this.startAutoConversion();
    }
  }

  // запуск автоматической конвертации
  private startAutoConversion(): void {
    // очищаем предыдущий таймер, если есть
    if (this.autoConvertTimer) {
      clearTimeout(this.autoConvertTimer);
    }
    
    // запускаем конвертацию через небольшую задержку (500 мс = 0.5 секунды)
    this.autoConvertTimer = setTimeout(() => {
      this.convertFile();
    }, 500);
  }

  // расчет размера файла в читаемом формате
  calculateFileSize(size: number): void {
    if (size === 0) {
      this.fileSize = '0 Б';
      return;
    }

    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    
    this.fileSize = parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // получение иконки для типа файла
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'image-outline';
    } else if (mimeType.includes('pdf')) {
      return 'document-outline';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return 'document-outline';
    } else if (mimeType.includes('text')) {
      return 'document-text-outline';
    }
    return 'document-outline';
  }

  // определение исходного формата файла
  detectSourceFormat(file: File): void {
    // сначала пробуем определить по расширению файла
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension && this.supportedFormats.includes(extension)) {
      this.sourceFormat = extension;
      return;
    }

    // если расширение неопределено, пробуем определить по mime type
    if (file.type) {
      const mimeFormat = this.getFormatFromMimeType(file.type);
      if (mimeFormat) {
        this.sourceFormat = mimeFormat;
        return;
      }
    }

    // если не удалось определить - оставляем пустым
    this.sourceFormat = '';
  }

  // определение формата по mime type
  private getFormatFromMimeType(mimeType: string): string | null {
    const mimeToFormat: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/x-icon': 'ico',
      'image/tiff': 'tiff',
      'image/svg+xml': 'svg',
      'image/avif': 'avif',
      'image/heic': 'heic',
      'image/heif': 'heic',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'text/plain': 'txt',
      'application/rtf': 'rtf',
      'text/rtf': 'rtf'
    };

    return mimeToFormat[mimeType] || null;
  }

  // очистка выбранного файла
  clearFile(): void {
    // очищаем таймер, если есть
    if (this.autoConvertTimer) {
      clearTimeout(this.autoConvertTimer);
      this.autoConvertTimer = null;
    }
    
    this.selectedFile = null;
    this.fileSize = '';
    this.sourceFormat = '';
    this.conversionResult = null;
    this.downloadUrl = '';
    this.showDownloadButton = false;
    this.isLoading = false;
    this.isDragOver = false;
    
    // сброс значения input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // загрузка всех сохраненных настроек
  private loadAllSettings(): void {
    try {
      // загружаем целевой формат
      const savedFormat = localStorage.getItem(this.TARGET_FORMAT_KEY);
      if (savedFormat && savedFormat.trim() !== '') {
        this.targetFormat = savedFormat;
      } else {
        this.targetFormat = '';
      }

      // загружаем настройку автоскачивания
      const savedAutoDownload = localStorage.getItem(this.AUTO_DOWNLOAD_KEY);
      if (savedAutoDownload !== null) {
        this.autoDownloadEnabled = savedAutoDownload === 'true';
      }

      // загружаем статус первой конвертации
      const savedFirstConversion = localStorage.getItem(this.IS_FIRST_CONVERSION_KEY);
      if (savedFirstConversion !== null) {
        this.isFirstConversion = savedFirstConversion === 'true';
      } else {
        // если не сохранено, значит это первая конвертация
        this.isFirstConversion = true;
        this.saveToLocalStorage(this.IS_FIRST_CONVERSION_KEY, 'true');
      }
      
    } catch (error) {
      console.error('ошибка при чтении настроек:', error);
    }
  }

  // сохранение целевого формата
  private saveTargetFormat(format: string): void {
    if (!format || format.trim() === '') {
      return;
    }
    this.saveToLocalStorage(this.TARGET_FORMAT_KEY, format);
  }

  // сохранение настройки автоскачивания
  private saveAutoDownloadSetting(enabled: boolean): void {
    this.saveToLocalStorage(this.AUTO_DOWNLOAD_KEY, enabled.toString());
  }

  // сохранение статуса первой конвертации
  private saveFirstConversionStatus(isFirst: boolean): void {
    this.saveToLocalStorage(this.IS_FIRST_CONVERSION_KEY, isFirst.toString());
  }

  // общий метод сохранения в localStorage
  private saveToLocalStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`ошибка при сохранении ${key}:`, error);
    }
  }

  // обработчик изменения целевого формата пользователем
  onTargetFormatChange(format: string): void {
    if (format && format.trim() !== '') {
      this.targetFormat = format;
      this.saveTargetFormat(format);
      
      // если автоскачивание включено и уже есть выбранный файл - запускаем автоматическую конвертацию
      if (this.autoDownloadEnabled && this.selectedFile && this.sourceFormat) {
        this.startAutoConversion();
      }
    }
  }

  // обработчик изменения настройки автоскачивания
  onAutoDownloadChange(enabled: boolean): void {
    this.autoDownloadEnabled = enabled;
    this.saveAutoDownloadSetting(enabled);
    
    // если автоскачивание включили и уже есть выбранный файл с форматом - запускаем конвертацию
    if (enabled && this.selectedFile && this.sourceFormat && this.targetFormat) {
      this.startAutoConversion();
    }
  }

  // основная функция конвертации
  async convertFile(): Promise<void> {
    if (!this.selectedFile || !this.sourceFormat || !this.targetFormat) {
      this.showError('ошибка: заполните все поля');
      return;
    }

    // проверка на одинаковые форматы
    if (this.sourceFormat === this.targetFormat) {
      this.showError('ошибка: исходный и целевой форматы не могут быть одинаковыми');
      return;
    }

    // сохраняем выбранный целевой формат
    this.saveTargetFormat(this.targetFormat);

    this.isLoading = true;
    this.conversionResult = null;
    this.downloadUrl = '';
    this.showDownloadButton = false;

    try {
      let convertedBlob: Blob;

      // выбор метода конвертации в зависимости от типа файла
      if (this.isImageFile(this.sourceFormat)) {
        convertedBlob = await this.convertImage(this.selectedFile, this.targetFormat);
      } else if (this.isTextFile(this.sourceFormat)) {
        convertedBlob = await this.convertText(this.selectedFile, this.targetFormat);
      } else {
        throw new Error(`конвертация из ${this.sourceFormat} в ${this.targetFormat} пока не поддерживается`);
      }

      // создаем url для скачивания
      this.downloadUrl = URL.createObjectURL(convertedBlob);
      
      this.conversionResult = {
        success: true,
        message: `файл "${this.selectedFile.name}" успешно сконвертирован из ${this.sourceFormat.toUpperCase()} в ${this.targetFormat.toUpperCase()}!`
      };

      // определяем, нужно ли автоматически скачивать
      if (this.autoDownloadEnabled && !this.isFirstConversion) {
        // автоскачивание включено и это не первая конвертация - скачиваем автоматически
        this.downloadConvertedFile();
      } else {
        // показываем кнопку скачивания только если автоскачивание выключено
        if (!this.autoDownloadEnabled) {
          this.showDownloadButton = true;
        }
      }

      // если это была первая конвертация - сохраняем, что теперь это уже не первая
      if (this.isFirstConversion) {
        this.isFirstConversion = false;
        this.saveFirstConversionStatus(false);
      }
      
    } catch (error) {
      console.error('ошибка конвертации:', error);
      this.showError('ошибка при конвертации файла. убедитесь, что файл корректен.');
    } finally {
      this.isLoading = false;
    }
  }

  // проверка является ли файл изображением
  private isImageFile(format: string): boolean {
    const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'ico', 'tiff', 'svg', 'avif', 'heic'];
    return imageFormats.includes(format.toLowerCase());
  }

  // проверка является ли файл текстовым
  private isTextFile(format: string): boolean {
    const textFormats = ['txt', 'pdf', 'doc', 'docx', 'rtf'];
    return textFormats.includes(format.toLowerCase());
  }

  // конвертация изображений
  private convertImage(file: File, targetFormat: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // для svg используем текстовую конвертацию
      if (targetFormat.toLowerCase() === 'svg') {
        this.convertToSvg(file).then(resolve).catch(reject);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('canvas не поддерживается в этом браузере'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // для прозрачных форматов заливаем белым фоном
        if (['jpg', 'jpeg'].includes(targetFormat.toLowerCase())) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);

        // настройки для разных форматов
        const formatSettings = this.getImageFormatSettings(targetFormat);
        
        // конвертируем canvas в blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('не удалось сконвертировать изображение'));
          }
        }, formatSettings.mimeType, formatSettings.quality);
      };

      img.onerror = () => {
        reject(new Error('не удалось загрузить изображение'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // конвертация в svg (упрощенная)
  private async convertToSvg(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const svgContent = `
          <svg width="${img.width}" height="${img.height}" xmlns="http://www.w3.org/2000/svg">
            <image href="${URL.createObjectURL(file)}" width="${img.width}" height="${img.height}"/>
          </svg>
        `;
        resolve(new Blob([svgContent], { type: 'image/svg+xml' }));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // конвертация текстовых файлов
  private async convertText(file: File, targetFormat: string): Promise<Blob> {
    const text = await file.text();
    
    // на будущее: можно добавить логику преобразования между текстовыми форматами
    return new Blob([text], { 
      type: this.getMimeTypeFromFormat(targetFormat) 
    });
  }

  // получение настроек для формата изображения
  private getImageFormatSettings(format: string): { mimeType: string; quality: number } {
    const settings: { [key: string]: { mimeType: string; quality: number } } = {
      'jpg': { mimeType: 'image/jpeg', quality: 0.85 },
      'jpeg': { mimeType: 'image/jpeg', quality: 0.85 },
      'png': { mimeType: 'image/png', quality: 0.9 },
      'webp': { mimeType: 'image/webp', quality: 0.8 },
      'gif': { mimeType: 'image/gif', quality: 1.0 },
      'bmp': { mimeType: 'image/bmp', quality: 1.0 },
      'ico': { mimeType: 'image/x-icon', quality: 1.0 }
    };

    return settings[format.toLowerCase()] || { mimeType: 'image/png', quality: 0.9 };
  }

  // получение типа по формату
  private getMimeTypeFromFormat(format: string): string {
    const mimeTypes: { [key: string]: string } = {
      'txt': 'text/plain',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'rtf': 'application/rtf'
    };

    return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
  }

  // отображение ошибки
  private showError(message: string): void {
    this.conversionResult = {
      success: false,
      message: message
    };
  }

  // скачивание сконвертированного файла
  downloadConvertedFile(): void {
    if (this.downloadUrl && this.selectedFile) {
      const originalName = this.selectedFile.name.split('.')[0];
      const filename = `${originalName}_converted.${this.targetFormat}`;
      
      const link = document.createElement('a');
      link.href = this.downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // очистка url после скачивания
      setTimeout(() => {
        URL.revokeObjectURL(this.downloadUrl);
      }, 100);
    }
  }
}