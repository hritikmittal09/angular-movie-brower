import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { GlobalFeaturesService } from "./services/global-features.service";
import { HttpClient } from "@angular/common/http";
import { LocalStorageService } from "./services/local-storage.service";
import { CommonModule, DOCUMENT } from "@angular/common";
import { Movie } from "./interfaces/omdb-payload";
import { environment } from "./environments/environment";
import { WindowRef } from "./windowRef";

@Component({
  selector: "app-root",
  imports: [CommonModule],
  standalone: true,
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  providers: [GlobalFeaturesService, LocalStorageService, WindowRef],
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  // Fixed: Changed to use query parameter format
  private baseUrl = "https://www.omdbapi.com/";
  protected dataArr: any = [];

  windowWidth: number;
  localStorageObject: Movie[] = [];
  titleQuery?: string;
  yearQuery?: string;
  layout = "inline";
  currentMovie = 0;
  lightbox = false;
  movieNotFound: boolean = false;
  menuOpen: boolean = false;

  @ViewChild("title", { static: false }) title?: ElementRef;
  @ViewChild("year", { static: false }) year?: ElementRef;

  @HostListener('window:resize')
onResize() {
  this.windowWidth = window.innerWidth;
  this._globalFeatures.changeWidth(this.windowWidth);
}

  constructor(
    private _globalFeatures: GlobalFeaturesService,
    private _http: HttpClient,
    private _localStorageService: LocalStorageService,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.windowWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this._globalFeatures.currentWidth$.pipe(takeUntil(this.unsubscribe$)).subscribe((val: number) => {
      this.windowWidth ? (val = this.windowWidth) : null;
    });

    this.isThereStorage();
  }

  // prettier-ignore
  randomMovies: string[] = [
    "Before Sunrise", "Reservoir Dogs", "Groundhog Day", "Paddington", "Amélie", "Brokeback Mountain", "Donnie Darko", "Black Panther", "The Godfather",
    "The Shawshank Redemption", "The Empire Strikes Back", "Titanic", "Shiri", "The Lord of the Rings", "Mad Max 2", "Die Hard", "Den of Thieves",
    "Man with a Movie Camera", "Mirror", "Viridiana", "The Executioner", "Anatha Rathiriya", "Pura Handa Kaluwara", "Close Up", "The Commitments",
    "The Quiet Girl", "Giv'at Halfon Eina Ona", "Avanti Popolo", "Bicycle Thieves", "Heat", "Persona", "Rocky", "Superman", "The Dark Knight",
    "Himala", "Inception", "Avatar", "Pulp Fiction", "The Matrix", "Forrest Gump", "Jurrasic Park"
  ];

  isThereStorage() {
    const storage = this._localStorageService.getData("omdb");
    if (storage != "") {
      const parsed = JSON.parse(storage);
      this.dataArr = parsed[0];
    } else {
      this.generateMovies();
    }
    this.removeDuplicates();
  }

  removeDuplicates() {
    let result = "";
    let seen = new Set();

    for (let i = 0; i < this.dataArr.length; i++) {
      let char = this.dataArr[i];
      if (!seen.has(char)) {
        result += char;
        seen.add(char);
      }
    }

    return result;
  }

  generateMovies() {
    const randomMovies = this.getRandomMovies(8);
    Promise.all(randomMovies.map((movie: string) => this.fetchMultipleFlicks(movie)))
      .then((results) => {})
      .catch((error) => {
        console.error("Error fetching movies:", error);
      });
  }

  // Helper function to get 8 random movies
  getRandomMovies(count: number) {
    const shuffledMovies = this.randomMovies.sort(() => 0.5 - Math.random());
    return shuffledMovies.slice(0, count);
  }

  // Fixed: Proper URL construction with query parameters
  fetchMultipleFlicks(movie: string) {
    
    const url = `${this.baseUrl}?t=${encodeURIComponent(movie)}&apikey=${environment.key}`;
    
    
    
    this._http.get<Movie>(url).pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any) => {
        if (data.hasOwnProperty("Title")) {
          this.movieNotFound = false;
          this.dataArr.unshift(data);
          this.localStorageObject.push(this.dataArr);
          this._localStorageService.saveData("omdb", JSON.stringify(this.localStorageObject));
        } else {
          this.movieNotFound = true;
          setTimeout(() => {
            this.movieNotFound = false;
          }, 5000);
        }
      });
  }

  // Fixed: Proper URL construction
  fetchResults() {
    this.titleQuery = this.title!.nativeElement.value;
    this.yearQuery = this.year!.nativeElement.value;

    // Check if title is provided
    if (!this.titleQuery || this.titleQuery.trim() === '') {
      return;
    }

    let url = `${this.baseUrl}?t=${encodeURIComponent(this.titleQuery)}&apikey=${environment.key}`;
    
    // Add year if provided
    if (this.yearQuery && this.yearQuery.trim() !== '') {
      url += `&y=${this.yearQuery}`;
    }
    
    // Add API key
    //url += environment.key;

    this._http
      .get<Movie>(url)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any) => {
        if (data.hasOwnProperty("Title")) {
          this.movieNotFound = false;
          this.dataArr.unshift(data);
          this.localStorageObject.push(this.dataArr);
          this._localStorageService.saveData("omdb", JSON.stringify(this.localStorageObject));
        } else {
          this.movieNotFound = true;
          this.title!.nativeElement.value = "NOT FOUND";
          setTimeout(() => {
            this.movieNotFound = false;
            this.title!.nativeElement.value = "";
          }, 4000);
        }
      });

    this.title!.nativeElement.value = "";
    this.year!.nativeElement.value = "";
  }

  previousFlick() {
    this.currentMovie > 0 ? this.currentMovie-- : "";
  }

  nextFlick() {
    this.dataArr.length > this.currentMovie ? this.currentMovie++ : "";
  }

  setLayout(val: string) {
    this.layout = val;
  }

  openLightbox(i: number) {
    this.currentMovie = i;
    this.lightbox = true;
  }

  closeLightbox() {
    this.lightbox = false;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}