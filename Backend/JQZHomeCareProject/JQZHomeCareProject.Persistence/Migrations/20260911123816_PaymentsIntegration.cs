using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JQZHomeCareProject.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PaymentsIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Visits_PatientPackages_PatientPackageId",
                table: "Visits");

            migrationBuilder.DropForeignKey(
                name: "FK_Visits_PractitionerSettlements_SettlementId",
                table: "Visits");

            migrationBuilder.DropTable(
                name: "InstallmentPayments");

            migrationBuilder.DropTable(
                name: "PractitionerSettlements");

            migrationBuilder.DropIndex(
                name: "IX_Visits_PractitionerId_SettlementId",
                table: "Visits");

            migrationBuilder.DropIndex(
                name: "IX_Visits_SettlementId",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "SettlementId",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "AmountPaid",
                table: "PatientPackages");

            migrationBuilder.DropColumn(
                name: "AmountPending",
                table: "PatientPackages");

            migrationBuilder.DropColumn(
                name: "ReceivedBy",
                table: "PatientPackages");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "PatientPackages");

            migrationBuilder.AlterColumn<string>(
                name: "PatientNameSnapshot",
                table: "Visits",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PatientDescriptionSnapshot",
                table: "Visits",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PatientAddressSnapshot",
                table: "Visits",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CheckOutLocation",
                table: "Visits",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CheckInLocation",
                table: "Visits",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "PatientPackages",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DefaultAmount",
                table: "PatientPackages",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientPackageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PractitionerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VisitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DefaultAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AmountPaid = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DefaultPShareAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PShareAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsSettled = table.Column<bool>(type: "bit", nullable: false),
                    SettledDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SettledByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_PatientPackages_PatientPackageId",
                        column: x => x.PatientPackageId,
                        principalTable: "PatientPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Payments_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Payments_Practitioners_PractitionerId",
                        column: x => x.PractitionerId,
                        principalTable: "Practitioners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_Users_SettledByUserId",
                        column: x => x.SettledByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Payments_Visits_VisitId",
                        column: x => x.VisitId,
                        principalTable: "Visits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_PractitionerId",
                table: "Visits",
                column: "PractitionerId");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_PractitionerId_ScheduledDate",
                table: "Visits",
                columns: new[] { "PractitionerId", "ScheduledDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_ScheduledDate",
                table: "Visits",
                column: "ScheduledDate");

            migrationBuilder.CreateIndex(
                name: "IX_PatientPackages_CollectionStatus",
                table: "PatientPackages",
                column: "CollectionStatus");

            migrationBuilder.CreateIndex(
                name: "IX_PatientPackages_Status",
                table: "PatientPackages",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PatientId",
                table: "Payments",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PatientPackageId",
                table: "Payments",
                column: "PatientPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PractitionerId_IsSettled",
                table: "Payments",
                columns: new[] { "PractitionerId", "IsSettled" });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_SettledByUserId",
                table: "Payments",
                column: "SettledByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_VisitId",
                table: "Payments",
                column: "VisitId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Visits_PatientPackages_PatientPackageId",
                table: "Visits",
                column: "PatientPackageId",
                principalTable: "PatientPackages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Visits_PatientPackages_PatientPackageId",
                table: "Visits");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Visits_PractitionerId",
                table: "Visits");

            migrationBuilder.DropIndex(
                name: "IX_Visits_PractitionerId_ScheduledDate",
                table: "Visits");

            migrationBuilder.DropIndex(
                name: "IX_Visits_ScheduledDate",
                table: "Visits");

            migrationBuilder.DropIndex(
                name: "IX_PatientPackages_CollectionStatus",
                table: "PatientPackages");

            migrationBuilder.DropIndex(
                name: "IX_PatientPackages_Status",
                table: "PatientPackages");

            migrationBuilder.DropColumn(
                name: "Amount",
                table: "PatientPackages");

            migrationBuilder.DropColumn(
                name: "DefaultAmount",
                table: "PatientPackages");

            migrationBuilder.AlterColumn<string>(
                name: "PatientNameSnapshot",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PatientDescriptionSnapshot",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PatientAddressSnapshot",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CheckOutLocation",
                table: "Visits",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CheckInLocation",
                table: "Visits",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SettlementId",
                table: "Visits",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "AmountPaid",
                table: "PatientPackages",
                type: "decimal(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AmountPending",
                table: "PatientPackages",
                type: "decimal(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ReceivedBy",
                table: "PatientPackages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "PatientPackages",
                type: "decimal(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "InstallmentPayments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientPackageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VisitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReceivedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstallmentPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InstallmentPayments_PatientPackages_PatientPackageId",
                        column: x => x.PatientPackageId,
                        principalTable: "PatientPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InstallmentPayments_Visits_VisitId",
                        column: x => x.VisitId,
                        principalTable: "Visits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PractitionerSettlements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PractitionerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReceivedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AmountCollectedByPractitioner = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CompanyShareAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PractitionerShareAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    ReceivedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TotalVisitAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WeekEndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WeekStartDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PractitionerSettlements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PractitionerSettlements_Practitioners_PractitionerId",
                        column: x => x.PractitionerId,
                        principalTable: "Practitioners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PractitionerSettlements_Users_ReceivedByUserId",
                        column: x => x.ReceivedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_PractitionerId_SettlementId",
                table: "Visits",
                columns: new[] { "PractitionerId", "SettlementId" });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_SettlementId",
                table: "Visits",
                column: "SettlementId");

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPayments_PatientPackageId_Date",
                table: "InstallmentPayments",
                columns: new[] { "PatientPackageId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_InstallmentPayments_VisitId",
                table: "InstallmentPayments",
                column: "VisitId");

            migrationBuilder.CreateIndex(
                name: "IX_PractitionerSettlements_PractitionerId_WeekStartDate_WeekEndDate",
                table: "PractitionerSettlements",
                columns: new[] { "PractitionerId", "WeekStartDate", "WeekEndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_PractitionerSettlements_ReceivedByUserId",
                table: "PractitionerSettlements",
                column: "ReceivedByUserId");

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
    }
}
