using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JQZHomeCareProject.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PatientAndPackages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Packages_Services_ServiceId",
                table: "Packages");

            migrationBuilder.DropForeignKey(
                name: "FK_Visits_Packages_PackageId",
                table: "Visits");

            migrationBuilder.DropForeignKey(
                name: "FK_Visits_PractitionerSettlements_PractitionerSettlementId",
                table: "Visits");

            migrationBuilder.DropIndex(
                name: "IX_Visits_PractitionerId",
                table: "Visits");

            migrationBuilder.RenameColumn(
                name: "PractitionerSettlementId",
                table: "Visits",
                newName: "SettlementId");

            migrationBuilder.RenameColumn(
                name: "PackageId",
                table: "Visits",
                newName: "PatientPackageId");

            migrationBuilder.RenameIndex(
                name: "IX_Visits_PractitionerSettlementId",
                table: "Visits",
                newName: "IX_Visits_SettlementId");

            migrationBuilder.RenameIndex(
                name: "IX_Visits_PackageId",
                table: "Visits",
                newName: "IX_Visits_PatientPackageId");

            migrationBuilder.AlterColumn<string>(
                name: "TimeSlot",
                table: "Visits",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Visits",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ScheduledDate",
                table: "Visits",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<int>(
                name: "ReceivedBy",
                table: "Visits",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "AmountReceived",
                table: "Visits",
                type: "decimal(12,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "AmountDue",
                table: "Visits",
                type: "decimal(12,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AddColumn<int>(
                name: "CollectionStatus",
                table: "Visits",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Patients",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Patients",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<int>(
                name: "VisitCount",
                table: "Patients",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceId",
                table: "Packages",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Packages",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "Packages",
                type: "decimal(12,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.CreateTable(
                name: "PatientPackages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PackageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaymentType = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    AmountPending = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    PurchaseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientPackages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientPackages_Packages_PackageId",
                        column: x => x.PackageId,
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientPackages_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_PractitionerId_SettlementId",
                table: "Visits",
                columns: new[] { "PractitionerId", "SettlementId" });

            migrationBuilder.CreateIndex(
                name: "IX_Patients_Phone",
                table: "Patients",
                column: "Phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PatientPackages_PackageId",
                table: "PatientPackages",
                column: "PackageId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientPackages_PatientId",
                table: "PatientPackages",
                column: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Packages_Services_ServiceId",
                table: "Packages",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Visits_PatientPackages_PatientPackageId",
                table: "Visits",
                column: "PatientPackageId",
                principalTable: "PatientPackages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Visits_PractitionerSettlements_SettlementId",
                table: "Visits",
                column: "SettlementId",
                principalTable: "PractitionerSettlements",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Packages_Services_ServiceId",
                table: "Packages");

            migrationBuilder.DropForeignKey(
                name: "FK_Visits_PatientPackages_PatientPackageId",
                table: "Visits");

            migrationBuilder.DropForeignKey(
                name: "FK_Visits_PractitionerSettlements_SettlementId",
                table: "Visits");

            migrationBuilder.DropTable(
                name: "PatientPackages");

            migrationBuilder.DropIndex(
                name: "IX_Visits_PractitionerId_SettlementId",
                table: "Visits");

            migrationBuilder.DropIndex(
                name: "IX_Patients_Phone",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "CollectionStatus",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "VisitCount",
                table: "Patients");

            migrationBuilder.RenameColumn(
                name: "SettlementId",
                table: "Visits",
                newName: "PractitionerSettlementId");

            migrationBuilder.RenameColumn(
                name: "PatientPackageId",
                table: "Visits",
                newName: "PackageId");

            migrationBuilder.RenameIndex(
                name: "IX_Visits_SettlementId",
                table: "Visits",
                newName: "IX_Visits_PractitionerSettlementId");

            migrationBuilder.RenameIndex(
                name: "IX_Visits_PatientPackageId",
                table: "Visits",
                newName: "IX_Visits_PackageId");

            migrationBuilder.AlterColumn<string>(
                name: "TimeSlot",
                table: "Visits",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ScheduledDate",
                table: "Visits",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReceivedBy",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "AmountReceived",
                table: "Visits",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(12,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "AmountDue",
                table: "Visits",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(12,2)");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Patients",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Patients",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceId",
                table: "Packages",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Packages",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "Packages",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(12,2)");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_PractitionerId",
                table: "Visits",
                column: "PractitionerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Packages_Services_ServiceId",
                table: "Packages",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Visits_Packages_PackageId",
                table: "Visits",
                column: "PackageId",
                principalTable: "Packages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Visits_PractitionerSettlements_PractitionerSettlementId",
                table: "Visits",
                column: "PractitionerSettlementId",
                principalTable: "PractitionerSettlements",
                principalColumn: "Id");
        }
    }
}
