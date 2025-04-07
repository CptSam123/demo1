import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import $ from 'jquery';
import 'datatables.net';


@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HeaderComponent,
    FooterComponent
  ]
})
export class UsersComponent implements OnInit, AfterViewInit {
  dataSource: any[] = [];
  newUser = { name: '', email: '', password: '' };
  editMode = false;
  showCreateForm = false;
  editUserData: any = { _id: '', name: '', email: '', password: '' };

  @ViewChild('usersTable') usersTable!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    // DataTable will be initialized after loadUsers runs
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    ($('#usersTable') as any).DataTable().search(value).draw();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  loadUsers(): void {
    this.http.get<any[]>('http://localhost:5000/api/college-users').subscribe(users => {
      this.dataSource = users;

      setTimeout(() => {
        const table = $('#usersTable');
        if ($.fn.DataTable.isDataTable(table)) {
          table.DataTable().destroy();
        }
        table.DataTable();
      }, 0);
    });
  }

  createUser(): void {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password) {
      alert('Please fill all fields.');
      return;
    }

    this.http.post('http://localhost:5000/api/college-users', this.newUser).subscribe(() => {
      this.newUser = { name: '', email: '', password: '' };
      this.loadUsers();
      this.showCreateForm = false;
    });
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`http://localhost:5000/api/college-users/${id}`).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  viewUser(user: any): void {
    alert(`Name: ${user.name}\nEmail: ${user.email}`);
  }

  startEdit(user: any): void {
    this.editUserData = { ...user, password: '' };
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editUserData = { _id: '', name: '', email: '', password: '' };
  }

  saveEdit(): void {
    const id = this.editUserData._id;
    this.http.put(`http://localhost:5000/api/college-users/${id}`, this.editUserData).subscribe(() => {
      this.loadUsers();
      this.cancelEdit();
    });
  }
}
