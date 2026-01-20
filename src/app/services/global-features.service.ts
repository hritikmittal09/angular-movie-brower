import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { WindowRef } from "../windowRef";

@Injectable({
  providedIn: "root",
})
export class GlobalFeaturesService {
  history?: string[] = [];
  someWidth: number = window.innerWidth;
  private winWidthSource = new BehaviorSubject(this.someWidth);
  currentWidth$ = this.winWidthSource.asObservable();
  categoryNavigationMenu$ = new BehaviorSubject<boolean>(false);

  constructor(private _windowRef: WindowRef) {}

  changeWidth(newValue: number) {
    this.winWidthSource.next(newValue);
    return newValue;
  }
}
