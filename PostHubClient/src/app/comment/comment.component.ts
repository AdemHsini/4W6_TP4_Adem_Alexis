
import { Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { faDownLong, faEllipsis, faImage, faL, faMessage, faUpLong, faXmark } from '@fortawesome/free-solid-svg-icons';
import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const domain = "https://localhost:7216/";

declare var Masonry: any;
declare var imagesLoaded: any;

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {

  @Input() comment: Comment | null = null;

  // Icônes Font Awesome
  faEllipsis = faEllipsis;
  faUpLong = faUpLong;
  faDownLong = faDownLong;
  faMessage = faMessage;
  faImage = faImage;
  faXmark = faXmark;

  // Plein de variables sus pour afficher / cacher des éléments HTML
  replyToggle: boolean = false;
  editToggle: boolean = false;
  repliesToggle: boolean = false;
  isAuthor: boolean = false;
  editMenu: boolean = false;
  displayInputFile: boolean = false;

  // Variables associées à des inputs
  newComment: string = "";
  editedText?: string;
  username: string | null = null;

  pictureIds: number[] = [];
  @ViewChild('masongrid') masongrid?: ElementRef;
  @ViewChildren('masongriditems') masongriditems?: QueryList<any>;
  @ViewChild("photoEdit", { static: false }) myPictureEdit?: ElementRef;
  @ViewChild("photo", { static: false }) myPicture?: ElementRef;


  constructor(public commentService: CommentService, public http: HttpClient) { }

  async ngOnInit() {
    this.isAuthor = localStorage.getItem("username") == this.comment?.username;
    this.editedText = this.comment?.text;
    if (this.comment != null)
      this.pictureIds = await this.commentService.getPictureIds(this.comment.id);
    this.username = localStorage.getItem("username");
  }

  // Créer un nouveau sous-commentaire au commentaire affiché dans ce composant
  // (Pouvoir les commentaires du post, donc ceux qui sont enfant du commentaire principal du post,
  // voyez le composant fullPost !)
  async createComment() {
    if (this.newComment == "") {
      alert("Écris un commentaire niochon !");
      return;
    }

    if (this.comment == null) return;
    if (this.comment.subComments == null) this.comment.subComments = [];

    let formData = new FormData();
    formData.append("text", this.newComment)

    if (this.myPicture != null) {

      let file = this.myPicture.nativeElement.files[0];
      if (file == null) return;

      let count = 0;
      while (file != null) {
        formData.append("image" + count, file);
        count++;
        file = this.myPicture.nativeElement.files[count];
      }
    }

    this.comment.subComments.push(await this.commentService.postComment(formData, this.comment.id));

    this.replyToggle = false;
    this.repliesToggle = true;
    this.newComment = "";
  }

  // Modifier le texte (et éventuellement ajouter des images) d'un commentaire
  async editComment() {

    if (this.comment == null || this.editedText == undefined) return;

    let formData = new FormData();
    formData.append("textEdit", this.editedText)

    if (this.myPictureEdit != null) {

      let file = this.myPictureEdit.nativeElement.files[0];
      if (file == null) return;

      let count = 0;
      while (file != null) {
        formData.append("image" + count, file);
        count++;
        file = this.myPictureEdit.nativeElement.files[count];
      }
    }


    let newMainComment = await this.commentService.editComment(formData, this.comment.id);
    this.pictureIds = await this.commentService.getPictureIds(this.comment.id);
    this.comment = newMainComment;
    this.editedText = this.comment.text;
    this.editMenu = false;
    this.editToggle = false;
  }

  // Supprimer un commentaire (le serveur va le soft ou le hard delete, selon la présence de sous-commentaires)
  async deleteComment() {
    if (this.comment == null || this.editedText == undefined) return;

    await this.commentService.deleteComment(this.comment.id);

    // Changements visuels pour le soft-delete
    if (this.comment.subComments != null && this.comment.subComments.length > 0) {
      this.comment.username = null;
      this.comment.upvoted = false;
      this.comment.downvoted = false;
      this.comment.upvotes = 0;
      this.comment.downvotes = 0;
      this.comment.text = "Commentaire supprimé.";
      this.comment.picturesIds = [];
      this.isAuthor = false;
    }
    // Changements ... visuels ... pour le hard-delete
    else {
      this.comment = null;
    }
  }

  // Upvoter (notez que ça annule aussi tout downvote fait pas soi-même)
  async upvote() {
    if (this.comment == null) return;
    await this.commentService.upvote(this.comment.id);

    // Changements visuels immédiats
    if (this.comment.upvoted) {
      this.comment.upvotes -= 1;
    }
    else {
      this.comment.upvotes += 1;
    }
    this.comment.upvoted = !this.comment.upvoted;
    if (this.comment.downvoted) {
      this.comment.downvoted = false;
      this.comment.downvotes -= 1;
    }
  }

  // Upvoter (notez que ça annule aussi tout upvote fait pas soi-même)
  async downvote() {
    if (this.comment == null) return;
    await this.commentService.downvote(this.comment.id);

    // Changements visuels immédiats
    if (this.comment.downvoted) {
      this.comment.downvotes -= 1;
    }
    else {
      this.comment.downvotes += 1;
    }
    this.comment.downvoted = !this.comment.downvoted;
    if (this.comment.upvoted) {
      this.comment.upvoted = false;
      this.comment.upvotes -= 1;
    }
  }

  async deletePicture(pictureId : number) {
    if (this.comment == null || this.editedText == undefined) return;
    await this.commentService.deleteCommentPicture(pictureId);

    this.pictureIds = await this.commentService.getPictureIds(this.comment.id);
  }

  async reportComment() {
    if (this.comment == null || this.editedText == undefined) return;
    await this.commentService.reportComment(this.comment.id);
    
    alert("Commentaire signalé !");
  }

  ngAfterViewInit() {
    this.masongriditems?.changes.subscribe(e => {
      this.initMasonry();
    });

    if (this.masongriditems!.length > 0) {
      this.initMasonry();
    }
  }

  initMasonry() {
    var grid = this.masongrid?.nativeElement;
    var msnry = new Masonry(grid, {
      itemSelector: '.grid-item',
      columnWidth: 1, // À modifier si le résultat est moche
      gutter: 0
    });

    imagesLoaded(grid).on('progress', function () {
      msnry.layout();
    });
  }
}
