import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { faDownLong, faEllipsis, faImage, faMessage, faUpLong, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Post } from '../models/post';
import { PostService } from '../services/post.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommentService } from '../services/comment.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommentComponent } from '../comment/comment.component';

declare var Masonry: any;
declare var imagesLoaded: any;

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [FormsModule, CommonModule, FontAwesomeModule, RouterModule, CommentComponent],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {
  // Variables pour l'affichage ou associées à des inputs
  post: Post | null = null;
  sorting: string = "popular";
  newComment: string = "";
  newMainCommentText: string = "";

  // Booléens sus pour cacher / afficher des boutons
  isAuthor: boolean = false;
  editMenu: boolean = false;
  displayInputFile: boolean = false;
  toggleMainCommentEdit: boolean = false;

  // Icônes Font Awesome
  faEllipsis = faEllipsis;
  faUpLong = faUpLong;
  faDownLong = faDownLong;
  faMessage = faMessage;
  faImage = faImage;
  faXmark = faXmark;

  @ViewChild('masongrid') masongrid?: ElementRef;
  @ViewChildren('masongriditems') masongriditems?: QueryList<any>;
  @ViewChild("photo", {static : false}) myPicture ?: ElementRef;
  
  constructor(public postService : PostService, public route : ActivatedRoute, public router : Router, public commentService : CommentService) { }


  constructor(public postService: PostService, public route: ActivatedRoute, public router: Router, public commentService: CommentService) { }

  async ngOnInit() {
    let postId: string | null = this.route.snapshot.paramMap.get("postId");

    if (postId != null) {
      this.post = await this.postService.getPost(+postId, this.sorting);
      this.newMainCommentText = this.post.mainComment == null ? "" : this.post.mainComment.text;
    }


    this.isAuthor = localStorage.getItem("username") == this.post?.mainComment?.username;
  }

  async toggleSorting() {
    if (this.post == null) return;
    this.post = await this.postService.getPost(this.post.id, this.sorting);
  }

  // Créer un commentaire directement associé au commentaire principal du post
  async createComment() {
    if (this.newComment == "") {
      alert("Écris un commentaire niochon");
      return;
    }
    let formData = new FormData();
    formData.append("text", this.newComment)

    if(this.myPicture != null) {

      let file = this.myPicture.nativeElement.files[0];
      if(file == null) return;

      let count = 0;
      while(file != null){
        formData.append("image" + count, file);
        count++;
        file = this.myPicture.nativeElement.files[count];
      }
    }

    this.post?.mainComment?.subComments?.push(await this.commentService.postComment(formData, this.post.mainComment.id));

    this.newComment = "";
  }

  // Upvote le commentaire principal du post
  async upvote() {
    if (this.post == null || this.post.mainComment == null) return;
    await this.commentService.upvote(this.post.mainComment.id);
    if (this.post.mainComment.upvoted) {
      this.post.mainComment.upvotes -= 1;
    }
    else {
      this.post.mainComment.upvotes += 1;
    }
    this.post.mainComment.upvoted = !this.post.mainComment.upvoted;
    if (this.post.mainComment.downvoted) {
      this.post.mainComment.downvoted = false;
      this.post.mainComment.downvotes -= 1;
    }
  }

  // Downvote le commentaire principal du post
  async downvote() {
    if (this.post == null || this.post.mainComment == null) return;
    await this.commentService.downvote(this.post.mainComment.id);
    if (this.post.mainComment.downvoted) {
      this.post.mainComment.downvotes -= 1;
    }
    else {
      this.post.mainComment.downvotes += 1;
    }
    this.post.mainComment.downvoted = !this.post.mainComment.downvoted;
    if (this.post.mainComment.upvoted) {
      this.post.mainComment.upvoted = false;
      this.post.mainComment.upvotes -= 1;
    }
  }

  // Modifier le commentaire principal du post
  async editMainComment() {
    if (this.post == null || this.post.mainComment == null) return;

    let commentDTO = {
      text: this.newMainCommentText
    }

    let newMainComment = await this.commentService.editComment(commentDTO, this.post?.mainComment.id);
    this.post.mainComment = newMainComment;
    this.toggleMainCommentEdit = false;
  }

  // Supprimer le commentaire principal du post. Notez que ça ne va pas supprimer le post en entier s'il y a le moindre autre commentaire.
  async deleteComment() {
    if (this.post == null || this.post.mainComment == null) return;
    await this.commentService.deleteComment(this.post.mainComment.id);
    this.router.navigate(["/"]);
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
      columnWidth: 320, // À modifier si le résultat est moche
      gutter: 3
    });

    imagesLoaded(grid).on('progress', function () {
      msnry.layout();
    });
  }

}
