import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MoonService } from './widget.service';

describe('MoonService', () => {
  let service: MoonService;
  let httpMock: HttpTestingController;

  const mockData = {
    moonPhases: [
      { name: 'Новолуние', emoji: '🌑', min: 0, max: 1 },
      { name: 'Полнолуние', emoji: '🌕', min: 13.38, max: 15.38 }
    ],
    descriptions: {
      'Новолуние': 'Луна не видна на небе',
      'Полнолуние': 'Луна полностью освещена'
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MoonService]
    });
    service = TestBed.inject(MoonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load widget data', (done) => {
    service.loadWidgetData().subscribe(data => {
      expect(data.moonPhases.length).toBe(2);
      expect(data.locale.COMPONENT_TITLE).toBe('Виджеты');
      done();
    });

    const req = httpMock.expectOne('assets/sample-data/moon-data.json');
    req.flush(mockData);
  });

  it('should calculate moon phase', (done) => {
    service.calculateMoonPhase(new Date('2024-01-15T00:00:00Z')).subscribe(data => {
      expect(data.phase).toBe('Новолуние');
      expect(data.emoji).toBe('🌑');
      expect(data.age).toContain('дней');
      expect(data.description).toBe('Луна не видна на небе');
      done();
    });

    const req = httpMock.expectOne('assets/sample-data/moon-data.json');
    req.flush(mockData);
  });

  it('should throw error when data loading fails', (done) => {
    service.calculateMoonPhase(new Date()).subscribe({
      next: () => fail('Should have thrown error'),
      error: (error) => {
        expect(error).toBeDefined();
        done();
      }
    });

    const req = httpMock.expectOne('assets/sample-data/moon-data.json');
    req.error(new ErrorEvent('Network error'));
  });
});