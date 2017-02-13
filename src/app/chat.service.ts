import {Injectable} from '@angular/core';
import {Http, Headers, Response, RequestOptions} from "@angular/http";

import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/publish";
import {Message} from "./Message";


@Injectable()
export class ChatService {

  private baseUrl: string = "http://localhost:8080/altenchat/";

  private headersGet = new Headers({'Accept': 'application/json'});
  private headersPost = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http) {
  }

  getAllMessages(): Observable<Response> {
    const url = `${this.baseUrl}`;

    return this.http.get(url, this.headersGet)
      .map(function (response: Response) {
        let res = response.json();
        console.log("response Service", res);
        return res;
      })
      .catch(this.handleError);
  }

  postMessage(message: Message): Observable<Response> {
    const url = `${this.baseUrl}`;
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(url, message, options)
      .map(this.extractData)
      .catch(this.handleError);
  }


  private handleError(error: Response | any): Observable<any> {
    return Observable.throw(error || 'Server error');
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }

}
