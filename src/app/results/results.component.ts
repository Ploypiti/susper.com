import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SearchService } from '../search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import * as fromRoot from '../reducers';
import { Store } from '@ngrx/store';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  items$: Observable<any>;
  totalResults$: Observable<number>;
  resultDisplay: string;
  noOfPages: number;
  presentPage: number;
  maxPage: number;
  start: number;
  end: number;
  begin: number;
  message: string;
  query: any;
  hoverBox: boolean = false;
  myUrl: any;
  myUrlList: Array<any> = [];
  searchdata: any = {
    query: '',
    verify: false,
    nav: 'filetype,protocol,hosts,authors,collections,namespace,topics,date',
    start: 0,
    indexof: 'off',
    meanCount: '5',
    resource: 'global',
    prefermaskfilter: '',
    rows: 10,
    timezoneOffset: 0,
  };
  querylook = {};
  getNumber(N) {
    let result = Array.apply(null, { length: N }).map(Number.call, Number);
    if (result.length > 10) {
      result = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    }
    return result;
  };
  advancedsearch() {
  }
  // display content on hover
  // --------------------------------
  overTitle() {
    if (this.hoverBox === true) {
      this.hoverBox = false;
    } else {
      this.hoverBox = true;
    }
  }
  trachHero(index, item) {
    return item ? item.id : undefined;
  }
  // ---------------------------------
  getPresentPage(N) {
    this.presentPage = N;
    this.searchdata.start = (this.presentPage) * this.searchdata.rows;
    this.route.navigate(['/search'], { queryParams: this.searchdata });

  }
  filterByDate() {
    this.searchdata.sort = 'last_modified desc';
    this.route.navigate(['/search'], { queryParams: this.searchdata });
  }
  filterByContext() {
    delete this.searchdata.sort;
    this.route.navigate(['/search'], { queryParams: this.searchdata });
  }
  Display(S) {
    return (this.resultDisplay === S);
  }
  videoClick() {
    this.getPresentPage(0);
    this.resultDisplay = 'videos';
    this.searchdata.rows = 10;
    this.searchdata.fq = 'url_file_ext_s:(avi+OR+mov+OR+flw+OR+gif)';
    this.route.navigate(['/search'], { queryParams: this.searchdata });
  }
  imageClick() {
    this.getPresentPage(0);
    this.resultDisplay = 'images';
    this.searchdata.rows = 100;
    this.searchdata.fq = 'url_file_ext_s:(png+OR+jpeg+OR+jpg+OR+gif)';
    this.route.navigate(['/search'], { queryParams: this.searchdata });
  }
  docClick() {
    this.getPresentPage(0);
    this.resultDisplay = 'all';
    delete this.searchdata.fq;
    this.searchdata.rows = 10;
    this.route.navigate(['/search'], { queryParams: this.searchdata });
  }
  incPresentPage() {
    this.presentPage = Math.min(this.noOfPages, this.presentPage + 1);
    this.getPresentPage(this.presentPage);

  }
  decPresentPage() {
    this.presentPage = Math.max(1, this.presentPage - 1);
    this.getPresentPage(this.presentPage);
  }
  getStyle(page) {
    return ((this.presentPage) === page);
  }
  constructor(private domsanitizer: DomSanitizer, private searchservice: SearchService, private route: Router, private activatedroute: ActivatedRoute,
    private store: Store<fromRoot.State>, private ref: ChangeDetectorRef) {

    this.activatedroute.queryParams.subscribe(query => {
      
      if (query['fq']) {

        if (query['fq'].includes('png')) {
          this.resultDisplay = 'images';
        } else if (query['fq'].includes('avi')) {
          this.resultDisplay = 'videos';
        } else {
          this.resultDisplay = 'all';
        }
      } else {
        this.resultDisplay = 'all';
      }

      this.presentPage = query['start'] / this.searchdata.rows;
      this.searchdata.query = query['query'];
      this.querylook = Object.assign({}, query);
      this.searchdata.sort = query['sort'];
      this.begin = Number(query['start']) + 1;
      this.message = 'loading...';
      this.start = (this.presentPage) * this.searchdata.rows;
      this.begin = this.start + 1;

      searchservice.getsearchresults(query);
      this.items$ = store.select(fromRoot.getItems);
      this.totalResults$ = store.select(fromRoot.getTotalResults);
      this.totalResults$.subscribe(totalResults => {
        this.end = Math.min(totalResults, this.begin + this.searchdata.rows - 1);
        this.message = 'showing results ' + this.begin + ' to ' + this.end + ' of ' + totalResults;
        this.noOfPages = Math.ceil(totalResults / this.searchdata.rows);
        this.maxPage = Math.min(this.searchdata.rows, this.noOfPages);
      });

      this.items$.subscribe(m => {

      for (let i = 0; i < m.length; i++) {
          this.myUrlList[i] = this.domsanitizer.bypassSecurityTrustResourceUrl(m[i].link);

        }
      });

    });
    this.presentPage = 0;
  };

  ngOnInit() {
    this.presentPage = 0;

  }

}