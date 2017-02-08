import { AltenChatClientNg2Page } from './app.po';

describe('alten-chat-client-ng2 App', function() {
  let page: AltenChatClientNg2Page;

  beforeEach(() => {
    page = new AltenChatClientNg2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
