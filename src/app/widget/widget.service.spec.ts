// moon.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MoonService, MoonPhase } from './widget.service';

describe('MoonService', () => {
  let service: MoonService;
  let httpMock: HttpTestingController;

  const mockMoonPhases = {
    moonPhases: [
      { name: 'Новолуние', emoji: '🌑', min: 0, max: 1 },
      { name: 'Полнолуние', emoji: '🌕', min: 13.38, max: 15.38 }
    ]
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

  describe('getMoonPhases', () => {
    it('should return moon phases from JSON file', () => {
      service.getMoonPhases().subscribe(phases => {
        expect(phases).toEqual(mockMoonPhases);
      });

      const req = httpMock.expectOne('assets/data/moon-phases.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockMoonPhases);
    });
  });

  describe('calculateMoonPhase', () => {
    it('should calculate moon phase with provided moon phases data', () => {
      const testDate = new Date('2024-01-15T00:00:00Z');
      const moonData = service.calculateMoonPhase(testDate, mockMoonPhases.moonPhases);
      
      expect(moonData).toBeDefined();
      expect(moonData.phase).toBeDefined();
      expect(moonData.emoji).toBeDefined();
      expect(moonData.age).toContain('дней');
      expect(moonData.description).toBeDefined();
    });
  });
});